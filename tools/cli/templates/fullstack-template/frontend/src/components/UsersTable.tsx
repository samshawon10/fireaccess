import type { AuthenticatedUser } from "@fireaccess/react-sdk";
import { CheckCircle2, CircleSlash, Search } from "lucide-react";

interface UsersTableProps {
  users: AuthenticatedUser[];
  selectedUid?: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectUser: (user: AuthenticatedUser) => void;
}

export const UsersTable = ({
  onSearchChange,
  onSelectUser,
  search,
  selectedUid,
  users,
}: UsersTableProps) => (
  <section className="rounded-lg border border-line bg-panel shadow-soft" id="users">
    <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-base font-semibold text-ink">Users</h2>
        <p className="text-sm text-slate-500">Firebase identities synchronized to MongoDB</p>
      </div>
      <label className="relative w-full md:w-72">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none ring-brand/20 focus:ring-4"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search users"
          value={search}
        />
      </label>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Permissions</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((user) => (
            <tr
              className={`cursor-pointer transition ${
                selectedUid === user.uid ? "bg-teal-50" : "hover:bg-slate-50"
              }`}
              key={user.uid}
              onClick={() => onSelectUser(user)}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-ink">{user.displayName ?? "Unnamed user"}</div>
                <div className="font-mono text-xs text-slate-500">{user.email ?? user.uid}</div>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">{user.permissions.length}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    user.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {user.isActive ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <CircleSlash className="h-3.5 w-3.5" />
                  )}
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
