export const FIREACCESS_ROLES = [
  "user",
  "agent",
  "manager",
  "admin",
  "super_admin",
] as const;

export type UserRole = (typeof FIREACCESS_ROLES)[number];

export type Permission = string;

export interface AuthenticatedUser {
  id: string;
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FireAccessPublicUser {
  id: string;
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  performedBy?: string;
  target?: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export interface PermissionDefinition {
  key: Permission;
  label: string;
  description?: string;
  category?: string;
}

export interface RoleDefinition {
  role: UserRole;
  label: string;
  rank: number;
  description?: string;
  inheritedFrom?: UserRole[];
}

export interface FireAccessListResult<TItem> {
  items: TItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FireAccessApiError {
  code: string;
  message: string;
  statusCode: number;
}

export interface FireAccessApiResponse<TData> {
  data: TData;
}

export interface FireAccessErrorResponse {
  error: FireAccessApiError;
}

export interface FireAccessSession {
  user: AuthenticatedUser;
  token?: string;
}

export interface FireAccessAdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roles: Record<UserRole, number>;
  auditEventsLast24h: number;
}

export const FIREACCESS_DEFAULT_PERMISSIONS = [
  "users:read",
  "users:update",
  "users:disable",
  "roles:manage",
  "permissions:manage",
  "audit:read",
  "settings:manage",
] as const;

export type DefaultPermission = (typeof FIREACCESS_DEFAULT_PERMISSIONS)[number];
