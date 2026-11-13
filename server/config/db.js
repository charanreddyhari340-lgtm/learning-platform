const mongoose = require('mongoose');

let mongoServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI?.trim();

    if (mongoUri) {
      try {
        console.log('Connecting to provided MongoDB URI...');
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected (URI): ${conn.connection.host}`);
        return conn;
      } catch (error) {
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
          throw error;
        }

        console.warn(
          `MongoDB URI connection failed (${error.message}). Falling back to in-memory MongoDB for development.`,
        );
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI must be configured in production.');
    }

    if (mongoServer) {
      console.log('Reusing in-memory MongoDB instance.');
      return mongoose.connection;
    }

    console.log('No MONGODB_URI provided or it is unreachable. Starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const inMemoryUri = mongoServer.getUri();
    const conn = await mongoose.connect(inMemoryUri);
    console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
    return conn;
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
