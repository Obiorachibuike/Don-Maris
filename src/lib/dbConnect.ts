
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Please define the MONGODB_URI environment variable in your .env file");
}

// Prevent multiple connections in serverless environments (like Vercel)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB Connected:", mongoose.connection.host);
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        throw new Error("Failed to connect to MongoDB: " + err.message);
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: any) {
    // If connection fails or URI is invalid, throw the error
    cached.promise = null; // Reset promise on failure
    throw new Error("❌ Invalid MongoDB URI or connection failed: " + error.message);
  }
}
