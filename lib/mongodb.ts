import mongoose, { Connection } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

/**
 * Cached connection interface.
 * - `conn`: the resolved Mongoose connection (null until connected)
 * - `promise`: the in-flight connection promise (null until initiated)
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

/**
 * Global cache to persist the connection across hot-reloads in development.
 * In production, module-level scope is sufficient since the process is long-lived.
 */
const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

async function connectToDatabase(): Promise<Connection> {
  // Return the existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }
.0
  // Reuse the in-flight promise if a connection attempt is already underway
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, {
        dbName: "next-js-crash-course",
        bufferCommands: false,
      })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
