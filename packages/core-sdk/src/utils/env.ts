import { ConfigurationError } from "./errors";

export interface FireAccessEnv {
  mongoUri: string;
  firebaseProjectId?: string;
  firebaseClientEmail?: string;
  firebasePrivateKey?: string;
  port: number;
  corsOrigin: string;
}

const getOptional = (env: NodeJS.ProcessEnv, key: string): string | undefined => {
  const value = env[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
};

const getRequired = (env: NodeJS.ProcessEnv, key: string): string => {
  const value = getOptional(env, key);

  if (!value) {
    throw new ConfigurationError(`Missing required environment variable: ${key}.`);
  }

  return value;
};

const getPort = (env: NodeJS.ProcessEnv): number => {
  const raw = getOptional(env, "PORT") ?? "4000";
  const port = Number(raw);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new ConfigurationError("PORT must be a valid TCP port.");
  }

  return port;
};

export const normalizePrivateKey = (privateKey?: string): string | undefined =>
  privateKey?.replace(/\\n/g, "\n");

export const validateFireAccessEnv = (
  env: NodeJS.ProcessEnv = process.env,
): FireAccessEnv => ({
  mongoUri: getRequired(env, "MONGO_URI"),
  firebaseProjectId: getOptional(env, "FIREBASE_PROJECT_ID"),
  firebaseClientEmail: getOptional(env, "FIREBASE_CLIENT_EMAIL"),
  firebasePrivateKey: normalizePrivateKey(getOptional(env, "FIREBASE_PRIVATE_KEY")),
  port: getPort(env),
  corsOrigin: getOptional(env, "CORS_ORIGIN") ?? "http://localhost:5173",
});
