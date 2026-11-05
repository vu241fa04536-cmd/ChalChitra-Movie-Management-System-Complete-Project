const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Movie = require('../models/Movie');
const User = require('../models/User');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chalchitra';
    console.log(`[Seeder] Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to database.');

    const dbJsonPath = path.join(__dirname, '../../db.json');
    if (!fs.existsSync(dbJsonPath)) {
      throw new Error(`db.json not found at ${dbJsonPath}`);
    }

    const rawData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
    const moviesData = rawData.movies || [];
    const usersData = rawData.users || [];

    console.log(`[Seeder] Found ${moviesData.length} movies and ${usersData.length} users in db.json.`);

    // Clear old data
    await Movie.deleteMany({});
    await User.deleteMany({});
    console.log('[Seeder] Cleared existing movies and users from MongoDB.');

    // Insert movies
    const moviesToInsert = moviesData.map((m) => ({
      legacyId: m.id,
      title: m.title,
      genre: m.genre || 'Action',
      language: m.language || 'English',
      releaseYear: m.releaseYear || 2024,
      rating: m.rating || 0,
      duration: m.duration || '120 min',
      description: m.description || '',
      poster: m.poster,
      trailer: m.trailer || '',
      status: m.status || 'released',
      type: m.type || 'movie',
      uploadDate: m.uploadDate ? new Date(m.uploadDate) : new Date(),
      watchLinks: m.watchLinks || {
        youtube: 'https://www.youtube.com',
        netflix: 'https://www.netflix.com',
        hotstar: 'https://www.hotstar.com',
      },
    }));

    const insertedMovies = await Movie.insertMany(moviesToInsert);
    console.log(`[Seeder] Successfully imported ${insertedMovies.length} movies/series into MongoDB!`);

    // Create a map from legacyId -> MongoDB ObjectId
    const legacyMap = {};
    insertedMovies.forEach((m) => {
      if (m.legacyId) {
        legacyMap[m.legacyId] = m._id;
      }
    });

    // Insert users
    for (const u of usersData) {
      const userWatchlist = (u.watchlist || [])
        .map((id) => legacyMap[id])
        .filter(Boolean);

      const userFavorites = (u.favorites || [])
        .map((id) => legacyMap[id])
        .filter(Boolean);

      await User.create({
        username: u.username,
        password: u.password, // pre-save hook will hash this securely
        email: `${u.username.toLowerCase().replace(/\s+/g, '')}@chalchitra.com`,
        role: 'user',
        watchlist: userWatchlist,
        favorites: userFavorites,
      });
    }

    // Also create a default Admin user
    const adminExists = await User.findOne({ username: 'Admin' });
    if (!adminExists) {
      await User.create({
        username: 'Admin',
        password: process.env.ADMIN_PASSWORD || 'ranjna@123',
        email: 'admin@chalchitra.com',
        role: 'admin',
      });
      console.log('[Seeder] Default Admin account created (username: Admin, password: ranjna@123)');
    }

    console.log('[Seeder] All data migrated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]', error);
    process.exit(1);
  }
};

seedData();
