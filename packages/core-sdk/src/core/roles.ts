import type { RoleDefinition, UserRole } from "@fireaccess/types";
import { FIREACCESS_ROLES } from "@fireaccess/types";
import { ForbiddenError } from "../utils/errors";

export const roleRank: Record<UserRole, number> = {
  user: 0,
  agent: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

export const FIREACCESS_ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    role: "user",
    label: "User",
    rank: roleRank.user,
    description: "Default authenticated account with self-service access.",
  },
  {
    role: "agent",
    label: "Agent",
    rank: roleRank.agent,
    description: "Support-level access for reading operational user data.",
    inheritedFrom: ["user"],
  },
  {
    role: "manager",
    label: "Manager",
    rank: roleRank.manager,
    description: "Team administration access for users and audit review.",
    inheritedFrom: ["agent", "user"],
  },
  {
    role: "admin",
    label: "Admin",
    rank: roleRank.admin,
    description: "Organization administration across users, roles, and permissions.",
    inheritedFrom: ["manager", "agent", "user"],
  },
  {
    role: "super_admin",
    label: "Super Admin",
    rank: roleRank.super_admin,
    description: "Complete platform access. Bypasses permission checks.",
    inheritedFrom: ["admin", "manager", "agent", "user"],
  },
];

export const isValidRole = (role: string): role is UserRole =>
  FIREACCESS_ROLES.includes(role as UserRole);

export const normalizeRoles = (roles: UserRole | UserRole[]): UserRole[] => {
  const normalized = Array.isArray(roles) ? roles : [roles];
  const uniqueRoles = [...new Set(normalized)];

  if (uniqueRoles.length === 0 || uniqueRoles.some((role) => !isValidRole(role))) {
    throw new ForbiddenError("A valid FireAccess role is required.");
  }

  return uniqueRoles;
};

export const hasRequiredRole = (
  userRole: UserRole,
  requiredRoles: UserRole | UserRole[],
): boolean => {
  const normalizedRequiredRoles = normalizeRoles(requiredRoles);
  const userRank = roleRank[userRole];

  return normalizedRequiredRoles.some(
    (requiredRole) => userRank >= roleRank[requiredRole],
  );
};

export const assertRole = (
  userRole: UserRole,
  requiredRoles: UserRole | UserRole[],
): void => {
  if (!hasRequiredRole(userRole, requiredRoles)) {
    throw new ForbiddenError("Your role is not allowed to perform this action.");
  }
};
