export type FireAccessErrorCode =
  | "FIREACCESS_CONFIGURATION_ERROR"
  | "FIREACCESS_UNAUTHORIZED"
  | "FIREACCESS_FORBIDDEN"
  | "FIREACCESS_INACTIVE_USER"
  | "FIREACCESS_VALIDATION_ERROR"
  | "FIREACCESS_NOT_FOUND";

export class FireAccessError extends Error {
  public readonly statusCode: number;
  public readonly code: FireAccessErrorCode;
  public readonly expose: boolean;

  public constructor(
    message: string,
    statusCode: number,
    code: FireAccessErrorCode,
    expose = true,
  ) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.expose = expose;
    Error.captureStackTrace?.(this, new.target);
  }
}

export class ConfigurationError extends FireAccessError {
  public constructor(message: string) {
    super(message, 500, "FIREACCESS_CONFIGURATION_ERROR", false);
  }
}

export class UnauthorizedError extends FireAccessError {
  public constructor(message = "Authentication is required.") {
    super(message, 401, "FIREACCESS_UNAUTHORIZED");
  }
}

export class ForbiddenError extends FireAccessError {
  public constructor(message = "You do not have permission to perform this action.") {
    super(message, 403, "FIREACCESS_FORBIDDEN");
  }
}

export class InactiveUserError extends FireAccessError {
  public constructor(message = "This user account is inactive.") {
    super(message, 403, "FIREACCESS_INACTIVE_USER");
  }
}

export class ValidationError extends FireAccessError {
  public constructor(message: string) {
    super(message, 400, "FIREACCESS_VALIDATION_ERROR");
  }
}

export class NotFoundError extends FireAccessError {
  public constructor(message = "The requested FireAccess resource was not found.") {
    super(message, 404, "FIREACCESS_NOT_FOUND");
  }
}
