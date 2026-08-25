import type {
  AuditLogRecord,
  AuthenticatedUser,
  FireAccessAdminStats,
  FireAccessListResult,
  PermissionDefinition,
  RoleDefinition,
  UserRole,
} from "@fireaccess/react-sdk";
import { firebaseAuth } from "./firebase";

const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  "",
);

if (!apiUrl) {
  throw new Error("Missing VITE_API_URL.");
}

const request = async <TData,>(
  path: string,
  init: RequestInit = {},
): Promise<TData> => {
  const token = await firebaseAuth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);

  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "FireAccess API request failed.");
  }

  return payload.data as TData;
};

export const api = {
  me: () => request<AuthenticatedUser>("/auth/me"),
  stats: () => request<FireAccessAdminStats>("/users/stats"),
  users: (params: { search?: string; role?: string } = {}) => {
    const search = new URLSearchParams();

    if (params.search) {
      search.set("search", params.search);
    }

    if (params.role) {
      search.set("role", params.role);
    }

    return request<FireAccessListResult<AuthenticatedUser>>(
      `/users?${search.toString()}`,
    );
  },
  updateUser: (
    uid: string,
    input: {
      role?: UserRole;
      permissions?: string[];
      isActive?: boolean;
    },
  ) =>
    request<AuthenticatedUser>(`/users/${uid}/access`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  auditLogs: (params: { search?: string } = {}) => {
    const search = new URLSearchParams();

    if (params.search) {
      search.set("search", params.search);
    }

    return request<FireAccessListResult<AuditLogRecord>>(
      `/audit?${search.toString()}`,
    );
  },
  roles: () => request<RoleDefinition[]>("/access/roles"),
  permissions: () => request<PermissionDefinition[]>("/access/permissions"),
};
