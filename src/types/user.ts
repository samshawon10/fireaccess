import type { DecodedIdToken } from "firebase-admin/auth";

export const FIREACCESS_ROLES = [
  "user",
  "agent",
  "manager",
  "admin",
  "super_admin",
] as const;

export type UserRole = (typeof FIREACCESS_ROLES)[number];

export type Permission = string;

export interface AuthenticatedUser {
  id: string;
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      firebaseUser?: DecodedIdToken;
    }
  }
}

export {};
