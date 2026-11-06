const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables: check server/.env first, fallback to root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const configureDNS = require('./config/dns');
const connectDB = require('./config/db');
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Validate critical environment variables
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'chalchitra_secret')) {
  console.warn('[Security Warning] JWT_SECRET is not set to a secure unique key in production.');
}

const app = express();

// Trust reverse proxies (Render, Vercel, Nginx, Cloudflare) for rate limiting and IP detection
app.set('trust proxy', 1);

// Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows external media / posters / CDNs
  })
);

// Restricted CORS Configuration
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, '')).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    // In development or if explicitly allowed, permit all origins
    if (!isProduction || process.env.ALLOW_ALL_CORS === 'true') {
      return callback(null, true);
    }

    // Check exact match or Vercel preview URLs if CLIENT_URL has a vercel domain
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed === origin) return true;
      // Allow Vercel preview deployments if main vercel app is registered
      if (allowed.includes('.vercel.app') && origin.endsWith('.vercel.app')) {
        return true;
      }
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy restriction: Origin '${origin}' is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Global API Rate Limiting (300 requests per 15 mins per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});
app.use('/api/', apiLimiter);

// Stricter Rate Limiter for Authentication endpoints to mitigate brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/admin-login', authLimiter);

// Body Parsers with size safety
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health Check Endpoint (Reflects true MongoDB connection status)
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection && mongoose.connection.readyState === 1;
  const statusCode = isConnected ? 200 : 503;

  res.status(statusCode).json({
    status: isConnected ? 'healthy' : 'unhealthy',
    project: 'ChalChitra Movie Management System',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: isConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection ? mongoose.connection.readyState : 0,
      host: isConnected ? mongoose.connection.host : null,
      name: isConnected ? mongoose.connection.name : null,
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Resource Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Centralized 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

// Server Lifecycle & Startup
let server = null;

const startServer = async () => {
  try {
    console.log('\n[ChalChitra Server] Initializing startup sequence...');

    // 1. Configure DNS if running on Windows with MongoDB Atlas
    configureDNS(process.env.MONGO_URI);

    // 2. Connect to Database (Fail-fast: server will not listen if DB fails)
    await connectDB();

    // 3. Start HTTP server
    const PORT = parseInt(process.env.PORT, 10) || 5000;
    const listenArgs = [PORT];
    if (process.env.HOST) {
      listenArgs.push(process.env.HOST);
    }

    server = app.listen(...listenArgs, () => {
      console.log(`[ChalChitra Server] Ready & listening on port ${PORT}`);
      console.log(`[ChalChitra Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[ChalChitra Server] Health check available at: http://localhost:${PORT}/api/health\n`);
    });

    // Handle port collision gracefully with actionable guidance
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ [PORT CONFLICT] Port ${PORT} is already in use by another active process.`);
        console.error('💡 Recommended Actions:');
        console.error(`   1. Check for a previously running ChalChitra instance.`);
        console.error(`   2. Change PORT in server/.env (e.g. PORT=5001).`);
        console.error(`   3. On Windows PowerShell, find the PID with:`);
        console.error(`      Get-NetTCPConnection -LocalPort ${PORT}\n`);
      } else {
        console.error('\n❌ [Server Network Error]:', err.message);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error('\n❌ [Fatal Startup Aborted]: Could not start backend server.');
    console.error(`   Reason: ${err.message}\n`);
    process.exit(1);
  }
};

// Graceful Shutdown Management
const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Initiating graceful termination...`);

  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server stopped accepting connections.');
    });
  }

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close(false);
      console.log('[MongoDB] Connection cleanly terminated.');
    }
  } catch (dbErr) {
    console.error('[MongoDB] Error during termination:', dbErr.message);
  }

  process.exit(0);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Start execution
startServer();

module.exports = app;
