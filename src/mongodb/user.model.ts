import mongoose from "mongoose";
import type { HydratedDocument, Model } from "mongoose";
import type { AuthenticatedUser, Permission, UserRole } from "../types/user";
import { FIREACCESS_ROLES } from "../types/user";

const { Schema, model, models } = mongoose;

export interface FireAccessUserRecord {
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

export type FireAccessUserDocument = HydratedDocument<FireAccessUserRecord>;

const userSchema = new Schema<FireAccessUserRecord>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      sparse: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: FIREACCESS_ROLES,
      default: "user",
      required: true,
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },
  },
  {
    collection: "fireaccess_users",
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ role: 1, isActive: 1 });

export const UserModel =
  (models.FireAccessUser as Model<FireAccessUserRecord> | undefined) ??
  model<FireAccessUserRecord>("FireAccessUser", userSchema);

export const toAuthenticatedUser = (
  document: FireAccessUserDocument,
): AuthenticatedUser => {
  const user = document.toObject();

  return {
    id: String(document._id),
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: user.role,
    permissions: user.permissions ?? [],
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
