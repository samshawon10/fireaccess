import type { AuthenticatedUser, Permission } from "@fireaccess/types";
import { ForbiddenError } from "../utils/errors";

export const normalizePermissions = (
  permissions: Permission | Permission[],
): Permission[] => {
  const normalized = Array.isArray(permissions) ? permissions : [permissions];

  if (normalized.some((permission) => typeof permission !== "string")) {
    throw new ForbiddenError("At least one valid permission is required.");
  }

  const uniquePermissions = [...new Set(normalized.map((permission) => permission.trim()))];

  if (
    uniquePermissions.length === 0 ||
    uniquePermissions.some((permission) => permission.length === 0)
  ) {
    throw new ForbiddenError("At least one valid permission is required.");
  }

  return uniquePermissions;
};

export const hasPermissions = (
  user: Pick<AuthenticatedUser, "role" | "permissions">,
  permissions: Permission | Permission[],
): boolean => {
  if (user.role === "super_admin") {
    return true;
  }

  const requiredPermissions = normalizePermissions(permissions);
  const assignedPermissions = new Set(user.permissions);

  return requiredPermissions.every((permission) => assignedPermissions.has(permission));
};

export const assertPermissions = (
  user: Pick<AuthenticatedUser, "role" | "permissions">,
  permissions: Permission | Permission[],
): void => {
  if (!hasPermissions(user, permissions)) {
    throw new ForbiddenError("Missing required permission.");
  }
};
