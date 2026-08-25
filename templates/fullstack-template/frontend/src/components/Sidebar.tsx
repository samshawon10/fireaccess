import { KeyRound, LayoutDashboard, ShieldCheck, Users } from "lucide-react";

const items = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Users", icon: Users },
  { label: "Access", icon: ShieldCheck },
  { label: "Audit", icon: KeyRound },
];

export const Sidebar = () => (
  <aside className="hidden w-64 shrink-0 border-r border-line bg-white lg:block">
    <div className="flex h-16 items-center border-b border-line px-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white">
        FA
      </div>
      <div className="ml-3">
        <p className="text-sm font-semibold text-ink">FireAccess</p>
        <p className="text-xs text-slate-500">Admin Console</p>
      </div>
    </div>
    <nav className="space-y-1 p-3">
      {items.map((item, index) => (
        <a
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
            index === 0
              ? "bg-slate-950 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-ink"
          }`}
          href={`#${item.label.toLowerCase()}`}
          key={item.label}
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          {item.label}
        </a>
      ))}
    </nav>
  </aside>
);
