import type { Request } from "express";
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { ConnectOptions } from "mongoose";
import type { LoggerLike } from "../utils/logger";
import type { Permission, UserRole } from "./user";

export interface FirebaseAdminLike {
  auth(): Auth;
}

export type FirebaseAdminInput = App | Auth | FirebaseAdminLike;

export type TokenExtractor = (request: Request) => string | null | undefined;

export interface AuditConfig {
  includeParams?: boolean;
  includeQuery?: boolean;
  logFailedRequests?: boolean;
  maxMetadataBytes?: number;
}

export interface FireAccessConfig {
  firebaseAdmin: FirebaseAdminInput;
  mongoUri: string;
  mongoOptions?: ConnectOptions;
  defaultRole?: UserRole;
  defaultPermissions?: Permission[];
  checkRevoked?: boolean;
  tokenExtractor?: TokenExtractor;
  audit?: AuditConfig;
  logger?: Partial<LoggerLike>;
}

export interface NormalizedFireAccessConfig {
  firebaseAdmin: FirebaseAdminInput;
  mongoUri: string;
  mongoOptions?: ConnectOptions;
  defaultRole: UserRole;
  defaultPermissions: Permission[];
  checkRevoked: boolean;
  tokenExtractor?: TokenExtractor;
  audit: Required<AuditConfig>;
  logger: LoggerLike;
}
