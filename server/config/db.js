const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance with fail-fast validation.
 *
 * @param {string} [customUri] - Optional override connection URI
 * @returns {Promise<mongoose.Connection>}
 */
const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGO_URI;

  if (!uri) {
    const errorMsg = 'MONGO_URI is missing. Please define MONGO_URI in server/.env or platform environment variables.';
    console.error(`\n❌ [MongoDB Fatal]: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Mask credentials in connection log for security
  const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  const options = {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    // Set up connection event listeners for runtime monitoring
    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB Warning] Lost connection to database cluster.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB Notice] Successfully reconnected to database cluster.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB Runtime Error]:', err.message);
    });

    return conn;
  } catch (error) {
    console.error(`\n❌ [MongoDB Connection Error]: Could not connect to ${sanitizedUri}`);
    console.error(`   Reason: ${error.message}`);
    throw error; // Fail fast so caller can abort startup
  }
};

module.exports = connectDB;
