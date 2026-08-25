import type {
  AuthenticatedUser,
  PermissionDefinition,
  RoleDefinition,
  UserRole,
} from "@fireaccess/react-sdk";
import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface AccessEditorProps {
  permissions: PermissionDefinition[];
  roles: RoleDefinition[];
  selectedUser: AuthenticatedUser | null;
  onSave: (input: {
    role: UserRole;
    permissions: string[];
    isActive: boolean;
  }) => Promise<void>;
}

export const AccessEditor = ({
  onSave,
  permissions,
  roles,
  selectedUser,
}: AccessEditorProps) => {
  const [role, setRole] = useState<UserRole>("user");
  const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setRole(selectedUser.role);
    setAssignedPermissions(selectedUser.permissions);
    setIsActive(selectedUser.isActive);
  }, [selectedUser]);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, PermissionDefinition[]>>(
      (groups, permission) => {
        const category = permission.category ?? "General";
        groups[category] ??= [];
        groups[category].push(permission);
        return groups;
      },
      {},
    );
  }, [permissions]);

  const togglePermission = (permission: string) => {
    setAssignedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  };

  if (!selectedUser) {
    return (
      <section className="rounded-lg border border-dashed border-line bg-panel p-6 text-sm text-slate-500">
        Select a user to edit access.
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-line bg-panel p-4 shadow-soft" id="access">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Access</h2>
          <p className="mt-1 font-mono text-xs text-slate-500">{selectedUser.uid}</p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving}
          onClick={() => {
            setSaving(true);
            void onSave({
              role,
              permissions: assignedPermissions,
              isActive,
            }).finally(() => setSaving(false));
          }}
        >
          <Save className="h-4 w-4" />
          Save
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Role
          <select
            className="h-10 rounded-lg border border-line bg-white px-3 text-sm outline-none ring-brand/20 focus:ring-4"
            onChange={(event) => setRole(event.target.value as UserRole)}
            value={role}
          >
            {roles.map((item) => (
              <option key={item.role} value={item.role}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center justify-between rounded-lg border border-line p-3 text-sm">
          <span>
            <span className="font-medium text-ink">Account active</span>
            <span className="block text-xs text-slate-500">Inactive users are blocked at middleware.</span>
          </span>
          <input
            checked={isActive}
            className="h-5 w-5 accent-brand"
            onChange={(event) => setIsActive(event.target.checked)}
            type="checkbox"
          />
        </label>

        <div className="grid gap-3">
          {Object.entries(groupedPermissions).map(([category, items]) => (
            <div className="rounded-lg border border-line p-3" key={category}>
              <h3 className="text-sm font-semibold text-ink">{category}</h3>
              <div className="mt-3 grid gap-2">
                {items.map((permission) => (
                  <label
                    className="flex items-center justify-between gap-3 text-sm"
                    key={permission.key}
                  >
                    <span>
                      <span className="font-medium text-slate-700">{permission.label}</span>
                      <span className="block font-mono text-xs text-slate-400">{permission.key}</span>
                    </span>
                    <input
                      checked={assignedPermissions.includes(permission.key)}
                      className="h-5 w-5 accent-brand"
                      onChange={() => togglePermission(permission.key)}
                      type="checkbox"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
