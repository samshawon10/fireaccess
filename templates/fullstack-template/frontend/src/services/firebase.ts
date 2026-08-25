import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const required = (key: string): string => {
  const value = import.meta.env[key] as string | undefined;

  if (!value) {
    throw new Error(`Missing Firebase environment variable: ${key}`);
  }

  return value;
};

export const firebaseApp = initializeApp({
  apiKey: required("VITE_FIREBASE_API_KEY"),
  authDomain: required("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: required("VITE_FIREBASE_PROJECT_ID"),
});

export const firebaseAuth = getAuth(firebaseApp);
