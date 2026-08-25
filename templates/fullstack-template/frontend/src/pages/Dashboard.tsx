import type {
  AuthenticatedUser,
  AuditLogRecord,
  FireAccessAdminStats,
  PermissionDefinition,
  RoleDefinition,
} from "@fireaccess/react-sdk";
import { signOut } from "firebase/auth";
import { Activity, ShieldCheck, UserCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AccessEditor } from "../components/AccessEditor";
import { AuditLogViewer } from "../components/AuditLogViewer";
import { Sidebar } from "../components/Sidebar";
import { StatCard } from "../components/StatCard";
import { UsersTable } from "../components/UsersTable";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { api } from "../services/api";
import { firebaseAuth } from "../services/firebase";

export const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [users, setUsers] = useState<AuthenticatedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AuthenticatedUser | null>(null);
  const [stats, setStats] = useState<FireAccessAdminStats | null>(null);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const debouncedUserSearch = useDebouncedValue(userSearch);
  const debouncedAuditSearch = useDebouncedValue(auditSearch);

  const reloadUsers = async () => {
    const response = await api.users({ search: debouncedUserSearch });
    setUsers(response.items);
    setSelectedUser((current) =>
      current
        ? response.items.find((item) => item.uid === current.uid) ?? response.items[0] ?? null
        : response.items[0] ?? null,
    );
  };

  useEffect(() => {
    void Promise.all([api.me(), api.stats(), api.roles(), api.permissions()]).then(
      ([me, nextStats, nextRoles, nextPermissions]) => {
        setCurrentUser(me);
        setStats(nextStats);
        setRoles(nextRoles);
        setPermissions(nextPermissions);
      },
    );
  }, []);

  useEffect(() => {
    void reloadUsers();
  }, [debouncedUserSearch]);

  useEffect(() => {
    void api.auditLogs({ search: debouncedAuditSearch }).then((response) => {
      setAuditLogs(response.items);
    });
  }, [debouncedAuditSearch]);

  const roleCount = useMemo(
    () => roles.reduce((sum, role) => sum + (stats?.roles[role.role] ?? 0), 0),
    [roles, stats],
  );

  return (
    <main className="flex min-h-screen bg-slate-100 text-slate-900">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur md:px-6">
          <div>
            <h1 className="text-lg font-semibold text-ink">Access Control</h1>
            <p className="text-xs text-slate-500">{currentUser?.email ?? "Signed in"}</p>
          </div>
          <button
            className="h-10 rounded-lg border border-line px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => signOut(firebaseAuth)}
          >
            Sign out
          </button>
        </header>

        <div className="grid gap-5 p-4 md:p-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total users"
              tone="teal"
              value={stats?.totalUsers ?? 0}
            />
            <StatCard
              icon={UserCheck}
              label="Active users"
              tone="indigo"
              value={stats?.activeUsers ?? 0}
            />
            <StatCard
              icon={ShieldCheck}
              label="Role assignments"
              tone="amber"
              value={roleCount}
            />
            <StatCard
              icon={Activity}
              label="Audit events"
              tone="rose"
              value={stats?.auditEventsLast24h ?? 0}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
            <UsersTable
              onSearchChange={setUserSearch}
              onSelectUser={setSelectedUser}
              search={userSearch}
              selectedUid={selectedUser?.uid}
              users={users}
            />
            <AccessEditor
              onSave={async (input) => {
                if (!selectedUser) {
                  return;
                }

                const updated = await api.updateUser(selectedUser.uid, input);
                setSelectedUser(updated);
                await Promise.all([reloadUsers(), api.stats().then(setStats)]);
              }}
              permissions={permissions}
              roles={roles}
              selectedUser={selectedUser}
            />
          </section>

          <AuditLogViewer
            logs={auditLogs}
            onSearchChange={setAuditSearch}
            search={auditSearch}
          />
        </div>
      </div>
    </main>
  );
};
