import "./types/express";

export { createFireAccess } from "./core/auth";
export type { FireAccess } from "./core/auth";

export {
  initializeFireAccess,
  createInitializeMiddleware,
  validateConfiguration,
} from "./core/initialize";
export type { FireAccessContext } from "./core/initialize";

export {
  FIREACCESS_ROLE_DEFINITIONS,
  assertRole,
  hasRequiredRole,
  isValidRole,
  normalizeRoles,
  roleRank,
} from "./core/roles";

export {
  assertPermissions,
  hasPermissions,
  normalizePermissions,
} from "./core/permissions";

export { syncFirebaseUser } from "./core/sync";

export {
  authenticateRequest,
  createAuthenticateMiddleware,
} from "./middleware/authenticate";
export { createRoleMiddleware } from "./middleware/role";
export { createPermissionMiddleware } from "./middleware/permission";
export { createAuditMiddleware } from "./middleware/audit";
export { createErrorHandlerMiddleware } from "./middleware/errorHandler";

export { connectMongo, disconnectMongo } from "./mongodb/connection";
export {
  UserModel,
  toAuthenticatedUser,
} from "./mongodb/user.model";
export type {
  FireAccessUserDocument,
  FireAccessUserRecord,
} from "./mongodb/user.model";
export { AuditModel } from "./mongodb/audit.model";
export type {
  AuditLogDocument,
  AuditLogRecord as MongoAuditLogRecord,
} from "./mongodb/audit.model";

export { FireAccessUserService } from "./services/userService";
export type {
  ListUsersOptions,
  UpdateUserAccessInput,
} from "./services/userService";
export { FireAccessAuditService } from "./services/auditService";
export type { ListAuditLogsOptions } from "./services/auditService";

export {
  extractBearerToken,
  resolveFirebaseAuth,
  verifyFirebaseToken,
} from "./firebase/verifyToken";

export {
  ConfigurationError,
  FireAccessError,
  ForbiddenError,
  InactiveUserError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./utils/errors";
export type { FireAccessErrorCode } from "./utils/errors";
export { createDefaultLogger, createLogger } from "./utils/logger";
export type { LoggerLike } from "./utils/logger";
export {
  normalizePrivateKey,
  validateFireAccessEnv,
} from "./utils/env";
export type { FireAccessEnv } from "./utils/env";

export type {
  AuditConfig,
  FirebaseAdminInput,
  FirebaseAdminLike,
  FireAccessConfig,
  NormalizedFireAccessConfig,
  TokenExtractor,
} from "./types/config";

export {
  FIREACCESS_DEFAULT_PERMISSIONS,
  FIREACCESS_ROLES,
} from "@fireaccess/types";
export type {
  AuthenticatedUser,
  AuditLogRecord,
  DefaultPermission,
  FireAccessAdminStats,
  FireAccessApiError,
  FireAccessApiResponse,
  FireAccessErrorResponse,
  FireAccessListResult,
  FireAccessPublicUser,
  FireAccessSession,
  Permission,
  PermissionDefinition,
  RoleDefinition,
  UserRole,
} from "@fireaccess/types";
