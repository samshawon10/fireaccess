export { createFireAccess } from "./core/auth";
export type { FireAccess } from "./core/auth";

export {
  initializeFireAccess,
  createInitializeMiddleware,
  validateConfiguration,
} from "./core/initialize";
export type { FireAccessContext } from "./core/initialize";

export {
  assertRole,
  hasRequiredRole,
  isValidRole,
  normalizeRoles,
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
export type { FireAccessErrorResponse } from "./middleware/errorHandler";

export { connectMongo } from "./mongodb/connection";
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
  AuditLogRecord,
} from "./mongodb/audit.model";

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
  UnauthorizedError,
} from "./utils/errors";
export type { FireAccessErrorCode } from "./utils/errors";
export { createDefaultLogger, createLogger } from "./utils/logger";
export type { LoggerLike } from "./utils/logger";

export type {
  FirebaseAdminInput,
  FirebaseAdminLike,
  AuditConfig,
  FireAccessConfig,
  NormalizedFireAccessConfig,
  TokenExtractor,
} from "./types/config";
export { FIREACCESS_ROLES } from "./types/user";
export type {
  AuthenticatedUser,
  Permission,
  UserRole,
} from "./types/user";
