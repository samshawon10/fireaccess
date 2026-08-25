export {
  createFireAccess,
  authenticateRequest,
  createAuthenticateMiddleware,
  createAuditMiddleware,
  createErrorHandlerMiddleware,
  createInitializeMiddleware,
  createPermissionMiddleware,
  createRoleMiddleware,
} from "fireaccess";

export type {
  AuditConfig,
  AuthenticatedUser,
  FirebaseAdminInput,
  FireAccess,
  FireAccessConfig,
  FireAccessErrorResponse,
  LoggerLike,
  NormalizedFireAccessConfig,
  Permission,
  TokenExtractor,
  UserRole,
} from "fireaccess";
