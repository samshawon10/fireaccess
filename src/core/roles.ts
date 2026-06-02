import type { UserRole } from "../types/user";
import { FIREACCESS_ROLES } from "../types/user";
import { ForbiddenError } from "../utils/errors";

const roleRank: Record<UserRole, number> = {
  user: 0,
  agent: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

export const isValidRole = (role: string): role is UserRole =>
  FIREACCESS_ROLES.includes(role as UserRole);

export const normalizeRoles = (roles: UserRole | UserRole[]): UserRole[] => {
  const normalized = Array.isArray(roles) ? roles : [roles];
  const uniqueRoles = [...new Set(normalized)];

  if (uniqueRoles.length === 0 || uniqueRoles.some((role) => !isValidRole(role))) {
    throw new ForbiddenError("A valid role is required.");
  }

  return uniqueRoles;
};

export const hasRequiredRole = (
  userRole: UserRole,
  requiredRoles: UserRole | UserRole[],
): boolean => {
  const normalizedRequiredRoles = normalizeRoles(requiredRoles);
  const userRank = roleRank[userRole];

  return normalizedRequiredRoles.some((requiredRole) => userRank >= roleRank[requiredRole]);
};

export const assertRole = (
  userRole: UserRole,
  requiredRoles: UserRole | UserRole[],
): void => {
  if (!hasRequiredRole(userRole, requiredRoles)) {
    throw new ForbiddenError("Your role is not allowed to perform this action.");
  }
};
