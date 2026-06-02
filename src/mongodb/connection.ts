import mongoose from "mongoose";
import type { ConnectOptions } from "mongoose";
import { ConfigurationError } from "../utils/errors";

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectMongo = async (
  mongoUri: string,
  options?: ConnectOptions,
): Promise<typeof mongoose> => {
  if (!mongoUri || typeof mongoUri !== "string") {
    throw new ConfigurationError("A valid MongoDB connection string is required.");
  }

  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    return mongoose;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 10_000,
      ...options,
    })
    .catch((error: unknown) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};
