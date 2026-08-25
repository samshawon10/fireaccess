import type { DecodedIdToken } from "firebase-admin/auth";
import type { UpdateQuery } from "mongoose";
import type { AuthenticatedUser } from "@fireaccess/types";
import type { NormalizedFireAccessConfig } from "../types/config";
import { UserModel, toAuthenticatedUser } from "../mongodb/user.model";
import type { FireAccessUserRecord } from "../mongodb/user.model";
import { UnauthorizedError } from "../utils/errors";

const getStringClaim = (
  claims: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = claims[key];

  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
};

const getIdentityFields = (
  decodedToken: DecodedIdToken,
): Partial<Pick<FireAccessUserRecord, "email" | "displayName" | "photoURL">> => {
  const claims = decodedToken as Record<string, unknown>;
  const identity: Partial<
    Pick<FireAccessUserRecord, "email" | "displayName" | "photoURL">
  > = {};
  const email = getStringClaim(claims, "email");
  const displayName = getStringClaim(claims, "name");
  const photoURL = getStringClaim(claims, "picture");

  if (email) {
    identity.email = email;
  }

  if (displayName) {
    identity.displayName = displayName;
  }

  if (photoURL) {
    identity.photoURL = photoURL;
  }

  return identity;
};

export const syncFirebaseUser = async (
  decodedToken: DecodedIdToken,
  config: NormalizedFireAccessConfig,
): Promise<AuthenticatedUser> => {
  if (!decodedToken.uid) {
    throw new UnauthorizedError("Firebase token is missing a UID.");
  }

  const identity = getIdentityFields(decodedToken);
  const now = new Date();
  const update: UpdateQuery<FireAccessUserRecord> = {
    $set: {
      ...identity,
      lastLoginAt: now,
    },
    $setOnInsert: {
      uid: decodedToken.uid,
      role: config.defaultRole,
      permissions: [...config.defaultPermissions],
      isActive: true,
    },
  };

  const user = await UserModel.findOneAndUpdate({ uid: decodedToken.uid }, update, {
    new: true,
    runValidators: true,
    setDefaultsOnInsert: true,
    upsert: true,
  }).exec();

  if (!user) {
    throw new UnauthorizedError("Unable to synchronize Firebase user.");
  }

  return toAuthenticatedUser(user);
};
