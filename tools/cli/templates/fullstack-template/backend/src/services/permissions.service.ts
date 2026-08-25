import type { PermissionDefinition } from "fireaccess";

export const permissions: PermissionDefinition[] = [
  {
    key: "profile:read",
    label: "Read own profile",
    category: "Profile",
  },
  {
    key: "users:read",
    label: "Read users",
    category: "Users",
  },
  {
    key: "users:update",
    label: "Update users",
    category: "Users",
  },
  {
    key: "users:disable",
    label: "Disable users",
    category: "Users",
  },
  {
    key: "roles:manage",
    label: "Manage roles",
    category: "Access",
  },
  {
    key: "permissions:manage",
    label: "Manage permissions",
    category: "Access",
  },
  {
    key: "audit:read",
    label: "Read audit logs",
    category: "Audit",
  },
];
