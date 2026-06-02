import type { ErrorRequestHandler } from "express";
import type { LoggerLike } from "../utils/logger";
import { FireAccessError } from "../utils/errors";

export interface FireAccessErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}

export const createErrorHandlerMiddleware = (
  logger?: LoggerLike,
): ErrorRequestHandler => {
  return (error, _request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    if (error instanceof FireAccessError) {
      response.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.expose ? error.message : "Internal server error.",
          statusCode: error.statusCode,
        },
      } satisfies FireAccessErrorResponse);
      return;
    }

    logger?.error("Unhandled FireAccess middleware error.", {
      error: error instanceof Error ? error.message : String(error),
    });

    response.status(500).json({
      error: {
        code: "FIREACCESS_INTERNAL_ERROR",
        message: "Internal server error.",
        statusCode: 500,
      },
    } satisfies FireAccessErrorResponse);
  };
};
