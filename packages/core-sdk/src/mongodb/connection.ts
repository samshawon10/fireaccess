import mongoose from "mongoose";
import type { ConnectOptions } from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;
let activeUri: string | null = null;

export const connectMongo = async (
  mongoUri: string,
  options?: ConnectOptions,
): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1 && activeUri === mongoUri) {
    return mongoose;
  }

  if (connectionPromise && activeUri === mongoUri) {
    return connectionPromise;
  }

  activeUri = mongoUri;
  connectionPromise = mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== "production",
    serverSelectionTimeoutMS: 10_000,
    ...options,
  });

  return connectionPromise;
};

export const disconnectMongo = async (): Promise<void> => {
  connectionPromise = null;
  activeUri = null;
  await mongoose.disconnect();
};
