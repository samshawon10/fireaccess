import type { RequestHandler } from "express";
import type { NormalizedFireAccessConfig } from "../types/config";
import type { Permission } from "../types/user";
import { assertPermissions, normalizePermissions } from "../core/permissions";
import { authenticateRequest } from "./authenticate";

export const createPermissionMiddleware = (
  config: NormalizedFireAccessConfig,
  permissions: Permission | Permission[],
): RequestHandler => {
  const requiredPermissions = normalizePermissions(permissions);

  return (request, _response, next) => {
    void authenticateRequest(request, config)
      .then((user) => {
        assertPermissions(user, requiredPermissions);
        next();
      })
      .catch((error: unknown) => {
        next(error);
      });
  };
};
