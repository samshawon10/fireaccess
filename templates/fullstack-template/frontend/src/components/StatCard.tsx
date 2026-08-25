import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: "teal" | "indigo" | "rose" | "amber";
}

const tones = {
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
};

export const StatCard = ({ icon: Icon, label, tone, value }: StatCardProps) => (
  <div className="rounded-lg border border-line bg-panel p-4 shadow-soft">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      </div>
      <div className={`rounded-lg p-2 ring-1 ${tones[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
    </div>
  </div>
);
