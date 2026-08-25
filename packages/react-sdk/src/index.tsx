import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Auth, User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import type {
  AuthenticatedUser,
  FireAccessApiResponse,
  Permission,
  UserRole,
} from "@fireaccess/types";

export interface FireAccessClientOptions {
  apiUrl: string;
  getIdToken: () => Promise<string | null | undefined>;
}

export interface FireAccessClient {
  request<TData>(path: string, init?: RequestInit): Promise<TData>;
  getProfile(): Promise<AuthenticatedUser>;
  listUsers(): Promise<AuthenticatedUser[]>;
}

export const createFireAccessClient = (
  options: FireAccessClientOptions,
): FireAccessClient => {
  const apiUrl = options.apiUrl.replace(/\/$/, "");

  const request = async <TData,>(
    path: string,
    init: RequestInit = {},
  ): Promise<TData> => {
    const token = await options.getIdToken();
    const headers = new Headers(init.headers);

    headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
    });
    const payload = (await response.json().catch(() => null)) as
      | FireAccessApiResponse<TData>
      | { error?: { message?: string } }
      | null;

    if (!response.ok) {
      const message =
        payload && "error" in payload && payload.error?.message
          ? payload.error.message
          : "FireAccess request failed.";
      throw new Error(message);
    }

    return payload && "data" in payload ? payload.data : (payload as TData);
  };

  return {
    request,
    getProfile: () => request<AuthenticatedUser>("/auth/me"),
    listUsers: async () => {
      const result = await request<{ items: AuthenticatedUser[] }>("/users");
      return result.items;
    },
  };
};

export interface FireAccessProviderProps {
  auth: Auth;
  apiUrl: string;
  children: ReactNode;
}

export interface FireAccessReactState {
  firebaseUser: User | null;
  user: AuthenticatedUser | null;
  loading: boolean;
  error: Error | null;
  client: FireAccessClient;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permissions: Permission | Permission[]) => boolean;
}

const FireAccessContext = createContext<FireAccessReactState | null>(null);

const roleRank: Record<UserRole, number> = {
  user: 0,
  agent: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

const normalize = <TValue,>(value: TValue | TValue[]): TValue[] =>
  Array.isArray(value) ? value : [value];

export const FireAccessProvider = ({
  auth,
  apiUrl,
  children,
}: FireAccessProviderProps): JSX.Element => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const client = useMemo(
    () =>
      createFireAccessClient({
        apiUrl,
        getIdToken: async () => auth.currentUser?.getIdToken(),
      }),
    [apiUrl, auth],
  );

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) {
      setUser(null);
      return;
    }

    setError(null);
    const profile = await client.getProfile();
    setUser(profile);
  }, [auth, client]);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setFirebaseUser(nextUser);
      setLoading(true);

      void (async () => {
        try {
          if (!nextUser) {
            setUser(null);
            return;
          }

          const profile = await client.getProfile();
          setUser(profile);
        } catch (unknownError) {
          setError(
            unknownError instanceof Error
              ? unknownError
              : new Error("Unable to load FireAccess user."),
          );
        } finally {
          setLoading(false);
        }
      })();
    });
  }, [auth, client]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user) {
        return false;
      }

      const requiredRoles = normalize(roles);
      return requiredRoles.some((role) => roleRank[user.role] >= roleRank[role]);
    },
    [user],
  );

  const hasPermission = useCallback(
    (permissions: Permission | Permission[]) => {
      if (!user) {
        return false;
      }

      if (user.role === "super_admin") {
        return true;
      }

      const assigned = new Set(user.permissions);
      return normalize(permissions).every((permission) => assigned.has(permission));
    },
    [user],
  );

  const value = useMemo<FireAccessReactState>(
    () => ({
      firebaseUser,
      user,
      loading,
      error,
      client,
      refreshUser,
      hasRole,
      hasPermission,
    }),
    [
      client,
      error,
      firebaseUser,
      hasPermission,
      hasRole,
      loading,
      refreshUser,
      user,
    ],
  );

  return createElement(FireAccessContext.Provider, { value }, children);
};

export const useFireAccess = (): FireAccessReactState => {
  const context = useContext(FireAccessContext);

  if (!context) {
    throw new Error("useFireAccess must be used inside FireAccessProvider.");
  }

  return context;
};

export const useFireAccessUser = (): AuthenticatedUser | null =>
  useFireAccess().user;

export interface GuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface RequireRoleProps extends GuardProps {
  roles: UserRole | UserRole[];
}

export const RequireRole = ({
  roles,
  children,
  fallback = null,
}: RequireRoleProps): JSX.Element => {
  const { hasRole, loading } = useFireAccess();

  if (loading) {
    return <span>Loading...</span>;
  }

  return <>{hasRole(roles) ? children : fallback}</>;
};

export interface RequirePermissionProps extends GuardProps {
  permissions: Permission | Permission[];
}

export const RequirePermission = ({
  permissions,
  children,
  fallback = null,
}: RequirePermissionProps): JSX.Element => {
  const { hasPermission, loading } = useFireAccess();

  if (loading) {
    return <span>Loading...</span>;
  }

  return <>{hasPermission(permissions) ? children : fallback}</>;
};

export type {
  AuditLogRecord,
  AuthenticatedUser,
  FireAccessAdminStats,
  FireAccessApiResponse,
  FireAccessListResult,
  FireAccessSession,
  Permission,
  PermissionDefinition,
  RoleDefinition,
  UserRole,
} from "@fireaccess/types";
