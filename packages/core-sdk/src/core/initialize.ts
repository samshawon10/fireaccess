import type { RequestHandler } from "express";
import type { NormalizedFireAccessConfig } from "../types/config";
import { connectMongo } from "../mongodb/connection";
import { ConfigurationError } from "../utils/errors";

export interface FireAccessContext {
  config: NormalizedFireAccessConfig;
  initialized: boolean;
}

export const validateConfiguration = (config: NormalizedFireAccessConfig): void => {
  if (!config.firebaseAdmin) {
    throw new ConfigurationError("Firebase Admin SDK instance is required.");
  }

  if (!config.mongoUri || typeof config.mongoUri !== "string") {
    throw new ConfigurationError("MongoDB URI is required.");
  }
};

export const initializeFireAccess = async (
  context: FireAccessContext,
): Promise<void> => {
  if (context.initialized) {
    return;
  }

  validateConfiguration(context.config);
  await connectMongo(context.config.mongoUri, context.config.mongoOptions);
  context.initialized = true;
};

export const createInitializeMiddleware = (
  context: FireAccessContext,
): RequestHandler => {
  let initialization: Promise<void> | null = null;

  return (_request, _response, next) => {
    initialization ??= initializeFireAccess(context);

    void initialization
      .then(() => {
        next();
      })
      .catch((error: unknown) => {
        initialization = null;
        context.config.logger.error("Failed to initialize FireAccess.", {
          error: error instanceof Error ? error.message : String(error),
        });
        next(error);
      });
  };
};
