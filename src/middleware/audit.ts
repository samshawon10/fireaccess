import type { RequestHandler } from "express";
import type { NormalizedFireAccessConfig } from "../types/config";
import { connectMongo } from "../mongodb/connection";
import { AuditModel } from "../mongodb/audit.model";
import { ForbiddenError } from "../utils/errors";

const resolveTarget = (params: Record<string, unknown>, originalUrl?: string): string => {
  const id = params.id;

  if (typeof id === "string" && id.trim().length > 0) {
    return id;
  }

  return originalUrl ?? "unknown";
};

const limitMetadata = (
  metadata: Record<string, unknown>,
  maxMetadataBytes: number,
): Record<string, unknown> => {
  const serialized = JSON.stringify(metadata);

  if (Buffer.byteLength(serialized, "utf8") <= maxMetadataBytes) {
    return metadata;
  }

  return {
    method: metadata.method,
    path: metadata.path,
    statusCode: metadata.statusCode,
    truncated: true,
    originalMetadataBytes: Buffer.byteLength(serialized, "utf8"),
  };
};

export const createAuditMiddleware = (
  config: NormalizedFireAccessConfig,
  action: string,
): RequestHandler => {
  const normalizedAction = action.trim();

  if (!normalizedAction) {
    throw new ForbiddenError("A valid audit action is required.");
  }

  return (request, response, next) => {
    response.once("finish", () => {
      if (!config.audit.logFailedRequests && response.statusCode >= 400) {
        return;
      }

      const performedBy = request.user?.uid ?? request.firebaseUser?.uid;
      const metadata: Record<string, unknown> = {
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        ip: request.ip,
        userAgent: request.get("user-agent"),
      };

      if (config.audit.includeParams) {
        metadata.params = request.params;
      }

      if (config.audit.includeQuery) {
        metadata.query = request.query;
      }

      void connectMongo(config.mongoUri, config.mongoOptions)
        .then(() =>
          AuditModel.create({
            action: normalizedAction,
            performedBy,
            target: resolveTarget(request.params, request.originalUrl),
            metadata: limitMetadata(metadata, config.audit.maxMetadataBytes),
            timestamp: new Date(),
          }),
        )
        .catch((error: unknown) => {
          config.logger.error("Failed to write audit log.", {
            action: normalizedAction,
            error: error instanceof Error ? error.message : String(error),
          });
        });
    });

    next();
  };
};
