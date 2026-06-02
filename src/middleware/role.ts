import type { RequestHandler } from "express";
import type { NormalizedFireAccessConfig } from "../types/config";
import type { UserRole } from "../types/user";
import { assertRole, normalizeRoles } from "../core/roles";
import { authenticateRequest } from "./authenticate";

export const createRoleMiddleware = (
  config: NormalizedFireAccessConfig,
  roles: UserRole | UserRole[],
): RequestHandler => {
  const requiredRoles = normalizeRoles(roles);

  return (request, _response, next) => {
    void authenticateRequest(request, config)
      .then((user) => {
        assertRole(user.role, requiredRoles);
        next();
      })
      .catch((error: unknown) => {
        next(error);
      });
  };
};
