
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env. It is currently missing.'
  );
}

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
  if (cached.conn) {
    console.log("Using cached database connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("Creating new database connection.");
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("Database connected successfully.");
      return mongoose;
    }).catch(err => {
        console.error("Database connection failed:", err);
        // Reset promise on error to allow retries
        cached.promise = null; 
        // Re-throw the error to be caught by the calling function
        throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // If the promise was rejected, it will be caught here.
    // Ensure the promise is cleared so the next request can try again.
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;
