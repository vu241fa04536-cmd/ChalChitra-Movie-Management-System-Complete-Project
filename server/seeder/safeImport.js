const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const configureDNS = require('../config/dns');
const connectDB = require('../config/db');
const Movie = require('../models/Movie');
const User = require('../models/User');

const safeImport = async () => {
  try {
    console.log('=== CHALCHITRA SAFE IDEMPOTENT DATABASE IMPORT ===\n');

    // 1. Configure DNS (Atlas SRV resolution on Windows)
    configureDNS(process.env.MONGO_URI);

    // 2. Connect to Database (fail-fast)
    await connectDB();

    // 3. Locate db.json
    const dbJsonPath = path.join(__dirname, '../../db.json');
    if (!fs.existsSync(dbJsonPath)) {
      throw new Error(`db.json not found at ${dbJsonPath}`);
    }

    const rawData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
    const sourceMovies = rawData.movies || [];
    const sourceUsers = rawData.users || [];

    console.log(`Found ${sourceMovies.length} movies and ${sourceUsers.length} users in db.json.\n`);

    let moviesImported = 0;
    let moviesSkipped = 0;
    const movieLegacyMap = {}; // legacyId -> MongoDB ObjectId

    // 4. Safely Import Movies (NO deleteMany, NO overwriting)
    console.log('--- MIGRATING MOVIES ---');
    for (const m of sourceMovies) {
      // Check if movie already exists by legacyId OR title
      const existing = await Movie.findOne({
        $or: [{ legacyId: m.id }, { title: m.title.trim() }],
      });

      if (existing) {
        console.log(`[SKIP] Already exists: "${existing.title}" (ID: ${existing._id}, legacyId: ${existing.legacyId})`);
        movieLegacyMap[m.id] = existing._id;
        moviesSkipped++;
      } else {
        const newMovie = await Movie.create({
          legacyId: m.id,
          title: m.title.trim(),
          genre: m.genre || 'Action',
          language: m.language || 'English',
          releaseYear: Number(m.releaseYear) || 2024,
          rating: Number(m.rating) || 0,
          duration: m.duration || '120 min',
          description: (m.description || '').trim() || `${m.title} - A cinematic experience available on ChalChitra.`,
          poster: (m.poster || '').trim(),
          trailer: (m.trailer || '').trim(),
          status: m.status || 'released',
          type: m.type || 'movie',
          uploadDate: m.uploadDate ? new Date(m.uploadDate) : new Date(),
          watchLinks: m.watchLinks || {
            youtube: 'https://www.youtube.com',
            netflix: 'https://www.netflix.com',
            hotstar: 'https://www.hotstar.com',
          },
        });
        console.log(`[IMPORTED] Added: "${newMovie.title}" (ID: ${newMovie._id}, legacyId: ${newMovie.legacyId})`);
        movieLegacyMap[m.id] = newMovie._id;
        moviesImported++;
      }
    }

    // 5. Safely Import Demo User if not existing (e.g. "Ranjna Ray") without touching existing users
    console.log('\n--- VERIFYING USER ACCOUNTS ---');
    let usersImported = 0;
    let usersSkipped = 0;

    for (const u of sourceUsers) {
      const existingUser = await User.findOne({ username: u.username.trim() });
      if (existingUser) {
        console.log(`[SKIP] User already exists: "${existingUser.username}" (ID: ${existingUser._id})`);
        usersSkipped++;
      } else {
        const resolvedWatchlist = (u.watchlist || [])
          .map((legacyId) => movieLegacyMap[legacyId])
          .filter(Boolean);
        const resolvedFavorites = (u.favorites || [])
          .map((legacyId) => movieLegacyMap[legacyId])
          .filter(Boolean);

        const newUser = await User.create({
          username: u.username.trim(),
          password: 'Password@123',
          email: u.email || `${u.username.toLowerCase().replace(/\s+/g, '')}@chalchitra.com`,
          role: u.role || 'user',
          watchlist: resolvedWatchlist,
          favorites: resolvedFavorites,
        });
        console.log(`[IMPORTED] Created User: "${newUser.username}" with ${resolvedWatchlist.length} watchlist and ${resolvedFavorites.length} favorites`);
        usersImported++;
      }
    }

    // Verify Admin User
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log(`[VERIFIED] Admin account active: "${adminUser.username}"`);
    } else {
      const defaultAdminPass = process.env.ADMIN_PASSWORD || 'ranjna@123';
      const createdAdmin = await User.create({
        username: 'Admin',
        password: defaultAdminPass,
        email: 'admin@chalchitra.com',
        role: 'admin',
        watchlist: [],
        favorites: [],
      });
      console.log(`[CREATED] Initialized Admin account: "${createdAdmin.username}"`);
    }

    const totalMovies = await Movie.countDocuments();
    const totalUsers = await User.countDocuments();

    console.log('\n================================================');
    console.log(`SUMMARY:`);
    console.log(`  Movies Imported : ${moviesImported}`);
    console.log(`  Movies Skipped  : ${moviesSkipped}`);
    console.log(`  Users Imported  : ${usersImported}`);
    console.log(`  Users Skipped   : ${usersSkipped}`);
    console.log(`  Total in Atlas  : ${totalMovies} movies, ${totalUsers} users`);
    console.log('================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ [Migration Error]:', error.message);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

safeImport();
