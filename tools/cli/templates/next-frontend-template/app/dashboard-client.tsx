"use client";

import type {
  AuthenticatedUser,
  AuditLogRecord,
  FireAccessAdminStats,
  FireAccessListResult,
  PermissionDefinition,
  RoleDefinition,
  UserRole,
} from "@fireaccess/react-sdk";
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  type LucideIcon,
  Activity,
  CheckCircle2,
  FileClock,
  KeyRound,
  LogIn,
  Save,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const required = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const firebaseApp = initializeApp({
  apiKey: required(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  ),
  authDomain: required(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  ),
  projectId: required(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  ),
});

const auth = getAuth(firebaseApp);
const apiUrl = required(
  "NEXT_PUBLIC_API_URL",
  process.env.NEXT_PUBLIC_API_URL,
).replace(/\/$/, "");

const request = async <TData,>(
  path: string,
  init: RequestInit = {},
): Promise<TData> => {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiUrl}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "FireAccess API request failed.");
  }

  return payload.data as TData;
};

const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) => (
  <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      </div>
      <div className="rounded-lg bg-teal-50 p-2 text-brand ring-1 ring-teal-100">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (unknownError) {
      setError(
        unknownError instanceof Error ? unknownError.message : "Unable to sign in.",
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-white">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-ink">FireAccess Admin</h1>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <input
            className="h-11 rounded-lg border border-line px-3 outline-none ring-brand/20 focus:ring-4"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            value={email}
          />
          <input
            className="h-11 rounded-lg border border-line px-3 outline-none ring-brand/20 focus:ring-4"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            value={password}
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-medium text-white">
            <LogIn className="h-4 w-4" />
            Sign in
          </button>
        </form>
        <button
          className="mt-3 h-11 w-full rounded-lg border border-line text-sm font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
        >
          Continue with Google
        </button>
      </section>
    </main>
  );
};

export const DashboardClient = () => {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [me, setMe] = useState<AuthenticatedUser | null>(null);
  const [stats, setStats] = useState<FireAccessAdminStats | null>(null);
  const [users, setUsers] = useState<AuthenticatedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AuthenticatedUser | null>(null);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    const [profile, nextStats, nextRoles, nextPermissions, nextUsers, nextLogs] =
      await Promise.all([
        request<AuthenticatedUser>("/auth/me"),
        request<FireAccessAdminStats>("/users/stats"),
        request<RoleDefinition[]>("/access/roles"),
        request<PermissionDefinition[]>("/access/permissions"),
        request<FireAccessListResult<AuthenticatedUser>>("/users"),
        request<FireAccessListResult<AuditLogRecord>>("/audit"),
      ]);

    setMe(profile);
    setStats(nextStats);
    setRoles(nextRoles);
    setPermissions(nextPermissions);
    setUsers(nextUsers.items);
    setSelectedUser(nextUsers.items[0] ?? null);
    setLogs(nextLogs.items);
  };

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setSignedIn(Boolean(user));
      setReady(true);

      if (user) {
        void load();
      }
    });
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const haystack = `${user.uid} ${user.email ?? ""} ${user.displayName ?? ""}`;
        return haystack.toLowerCase().includes(search.toLowerCase());
      }),
    [search, users],
  );

  if (!ready) {
    return <main className="grid min-h-screen place-items-center">Loading...</main>;
  }

  if (!signedIn) {
    return <SignIn />;
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
        <div>
          <h1 className="text-lg font-semibold text-ink">FireAccess Admin</h1>
          <p className="text-xs text-slate-500">{me?.email ?? "Signed in"}</p>
        </div>
        <button
          className="h-10 rounded-lg border border-line px-3 text-sm font-medium"
          onClick={() => signOut(auth)}
        >
          Sign out
        </button>
      </header>
      <div className="grid gap-5 p-6">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard icon={Users} label="Users" value={stats?.totalUsers ?? 0} />
          <StatCard icon={UserCheck} label="Active" value={stats?.activeUsers ?? 0} />
          <StatCard icon={ShieldCheck} label="Roles" value={roles.length} />
          <StatCard icon={Activity} label="Audit" value={stats?.auditEventsLast24h ?? 0} />
        </section>
        <section className="grid gap-5 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-lg border border-line bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-line p-4">
              <h2 className="font-semibold text-ink">Users</h2>
              <label className="relative w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  className="h-10 w-full rounded-lg border border-line pl-9 pr-3 text-sm outline-none ring-brand/20 focus:ring-4"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users"
                  value={search}
                />
              </label>
            </div>
            <div className="divide-y divide-line">
              {filteredUsers.map((user) => (
                <button
                  className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 text-left hover:bg-slate-50"
                  key={user.uid}
                  onClick={() => setSelectedUser(user)}
                >
                  <span>
                    <span className="block font-medium text-ink">
                      {user.displayName ?? "Unnamed user"}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {user.email ?? user.uid}
                    </span>
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    {user.role}
                  </span>
                  <span className="text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-ink">Access</h2>
                <p className="font-mono text-xs text-slate-500">
                  {selectedUser?.uid ?? "No user selected"}
                </p>
              </div>
              <Save className="h-5 w-5 text-brand" />
            </div>
            {selectedUser ? (
              <div className="mt-4 grid gap-3">
                <select
                  className="h-10 rounded-lg border border-line px-3 text-sm"
                  onChange={async (event) => {
                    const updated = await request<AuthenticatedUser>(
                      `/users/${selectedUser.uid}/access`,
                      {
                        method: "PATCH",
                        body: JSON.stringify({
                          role: event.target.value as UserRole,
                          permissions: selectedUser.permissions,
                          isActive: selectedUser.isActive,
                        }),
                      },
                    );
                    setSelectedUser(updated);
                    await load();
                  }}
                  value={selectedUser.role}
                >
                  {roles.map((role) => (
                    <option key={role.role} value={role.role}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <div className="grid gap-2">
                  {permissions.map((permission) => (
                    <label className="flex items-center justify-between text-sm" key={permission.key}>
                      <span>{permission.label}</span>
                      <input
                        checked={selectedUser.permissions.includes(permission.key)}
                        className="h-5 w-5 accent-brand"
                        readOnly
                        type="checkbox"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
        <section className="rounded-lg border border-line bg-white shadow-soft">
          <div className="flex items-center gap-2 border-b border-line p-4">
            <FileClock className="h-5 w-5 text-brand" />
            <h2 className="font-semibold text-ink">Audit logs</h2>
          </div>
          <div className="divide-y divide-line">
            {logs.map((log) => (
              <article className="grid gap-1 p-4 text-sm" key={log.id}>
                <p className="font-medium text-ink">{log.action}</p>
                <p className="font-mono text-xs text-slate-500">
                  {log.performedBy ?? "system"} -> {log.target ?? "unknown"}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};
