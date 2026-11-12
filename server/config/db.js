const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      // Production: use the provided MongoDB URI (Atlas, etc.)
      console.log('Connecting to provided MongoDB URI...');
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected (URI): ${conn.connection.host}`);
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI must be configured in production.');
      }

      // Development fallback: use in-memory MongoDB
      console.log('No MONGODB_URI provided. Starting in-memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error disconnecting DB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
