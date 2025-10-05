
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error(
      'The MONGODB_URI environment variable is missing or invalid. Please check your .env file.'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    }).catch(err => {
        console.error('Initial MongoDB connection error:', err);
        cached.promise = null; // Reset promise on initial connection failure
        throw new Error(`Could not connect to MongoDB. Please check your connection string and network access rules. Details: ${err.message}`);
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // The promise was rejected, so we set it back to null to allow for a retry on the next call.
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
