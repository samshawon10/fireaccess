import type { ErrorRequestHandler, RequestHandler } from "express";
import type {
  FireAccessConfig,
  NormalizedFireAccessConfig,
} from "../types/config";
import type { Permission, UserRole } from "../types/user";
import { createAuditMiddleware } from "../middleware/audit";
import { createAuthenticateMiddleware } from "../middleware/authenticate";
import { createErrorHandlerMiddleware } from "../middleware/errorHandler";
import { createPermissionMiddleware } from "../middleware/permission";
import { createRoleMiddleware } from "../middleware/role";
import { AuditModel } from "../mongodb/audit.model";
import { UserModel } from "../mongodb/user.model";
import { createInitializeMiddleware } from "./initialize";
import type { FireAccessContext } from "./initialize";
import { isValidRole } from "./roles";
import { createLogger } from "../utils/logger";
import { ConfigurationError } from "../utils/errors";

export interface FireAccess {
  initialize(): RequestHandler;
  authenticate(): RequestHandler;
  role(roles: UserRole | UserRole[]): RequestHandler;
  permission(permissions: Permission | Permission[]): RequestHandler;
  audit(action: string): RequestHandler;
  errorHandler(): ErrorRequestHandler;
  models: {
    UserModel: typeof UserModel;
    AuditModel: typeof AuditModel;
  };
}

const normalizeConfig = (config: FireAccessConfig): NormalizedFireAccessConfig => {
  if (!config || typeof config !== "object") {
    throw new ConfigurationError("FireAccess configuration is required.");
  }

  const defaultRole = config.defaultRole ?? "user";

  if (!isValidRole(defaultRole)) {
    throw new ConfigurationError("Default role must be a valid FireAccess role.");
  }

  const defaultPermissions = config.defaultPermissions ?? [];

  if (
    !Array.isArray(defaultPermissions) ||
    defaultPermissions.some((permission) => typeof permission !== "string")
  ) {
    throw new ConfigurationError(
      "Default permissions must be an array of non-empty strings.",
    );
  }

  const normalizedDefaultPermissions = defaultPermissions.map((permission) =>
    permission.trim(),
  );

  if (normalizedDefaultPermissions.some((permission) => permission.length === 0)) {
    throw new ConfigurationError(
      "Default permissions must be an array of non-empty strings.",
    );
  }

  if (
    config.checkRevoked !== undefined &&
    typeof config.checkRevoked !== "boolean"
  ) {
    throw new ConfigurationError("checkRevoked must be a boolean when provided.");
  }

  if (
    config.tokenExtractor !== undefined &&
    typeof config.tokenExtractor !== "function"
  ) {
    throw new ConfigurationError("tokenExtractor must be a function when provided.");
  }

  const audit = {
    includeParams: config.audit?.includeParams ?? true,
    includeQuery: config.audit?.includeQuery ?? false,
    logFailedRequests: config.audit?.logFailedRequests ?? true,
    maxMetadataBytes: config.audit?.maxMetadataBytes ?? 8_192,
  };

  if (!Number.isInteger(audit.maxMetadataBytes) || audit.maxMetadataBytes < 256) {
    throw new ConfigurationError("audit.maxMetadataBytes must be at least 256.");
  }

  return {
    firebaseAdmin: config.firebaseAdmin,
    mongoUri: config.mongoUri,
    mongoOptions: config.mongoOptions,
    defaultRole,
    defaultPermissions: [...new Set(normalizedDefaultPermissions)],
    checkRevoked: config.checkRevoked ?? false,
    tokenExtractor: config.tokenExtractor,
    audit,
    logger: createLogger(config.logger),
  };
};

class FireAccessClient implements FireAccess {
  private readonly context: FireAccessContext;

  public readonly models = {
    UserModel,
    AuditModel,
  };

  public constructor(config: FireAccessConfig) {
    this.context = {
      config: normalizeConfig(config),
      initialized: false,
    };
  }

  public initialize(): RequestHandler {
    return createInitializeMiddleware(this.context);
  }

  public authenticate(): RequestHandler {
    return createAuthenticateMiddleware(this.context.config);
  }

  public role(roles: UserRole | UserRole[]): RequestHandler {
    return createRoleMiddleware(this.context.config, roles);
  }

  public permission(permissions: Permission | Permission[]): RequestHandler {
    return createPermissionMiddleware(this.context.config, permissions);
  }

  public audit(action: string): RequestHandler {
    return createAuditMiddleware(this.context.config, action);
  }

  public errorHandler(): ErrorRequestHandler {
    return createErrorHandlerMiddleware(this.context.config.logger);
  }
}

export const createFireAccess = (config: FireAccessConfig): FireAccess =>
  new FireAccessClient(config);
