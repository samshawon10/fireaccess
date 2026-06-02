import { getAuth } from "firebase-admin/auth";
import type { Auth, DecodedIdToken } from "firebase-admin/auth";
import type { FirebaseAdminInput, FirebaseAdminLike } from "../types/config";
import { UnauthorizedError } from "../utils/errors";

const isFirebaseAuth = (value: FirebaseAdminInput): value is Auth =>
  typeof (value as Auth).verifyIdToken === "function";

const isFirebaseAdminLike = (value: FirebaseAdminInput): value is FirebaseAdminLike =>
  typeof (value as FirebaseAdminLike).auth === "function";

export const resolveFirebaseAuth = (firebaseAdmin: FirebaseAdminInput): Auth => {
  if (isFirebaseAuth(firebaseAdmin)) {
    return firebaseAdmin;
  }

  if (isFirebaseAdminLike(firebaseAdmin)) {
    return firebaseAdmin.auth();
  }

  return getAuth(firebaseAdmin);
};

export const extractBearerToken = (authorizationHeader?: string): string => {
  if (!authorizationHeader) {
    throw new UnauthorizedError("Missing Authorization header.");
  }

  const [scheme, token, ...extra] = authorizationHeader.trim().split(/\s+/);

  if (scheme.toLowerCase() !== "bearer" || !token || extra.length > 0) {
    throw new UnauthorizedError("Authorization header must use the Bearer scheme.");
  }

  return token;
};

export const verifyFirebaseToken = async (
  firebaseAdmin: FirebaseAdminInput,
  token: string,
  checkRevoked = false,
): Promise<DecodedIdToken> => {
  try {
    return await resolveFirebaseAuth(firebaseAdmin).verifyIdToken(token, checkRevoked);
  } catch {
    throw new UnauthorizedError("Invalid Firebase authentication token.");
  }
};
