import type { AuditLogRecord } from "@fireaccess/react-sdk";
import { FileClock, Search } from "lucide-react";

interface AuditLogViewerProps {
  logs: AuditLogRecord[];
  search: string;
  onSearchChange: (value: string) => void;
}

export const AuditLogViewer = ({
  logs,
  onSearchChange,
  search,
}: AuditLogViewerProps) => (
  <section className="rounded-lg border border-line bg-panel shadow-soft" id="audit">
    <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <FileClock className="h-5 w-5 text-brand" />
        <h2 className="text-base font-semibold text-ink">Audit logs</h2>
      </div>
      <label className="relative w-full md:w-72">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none ring-brand/20 focus:ring-4"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search audit events"
          value={search}
        />
      </label>
    </div>
    <div className="divide-y divide-line">
      {logs.map((log) => (
        <article className="grid gap-2 p-4 text-sm md:grid-cols-[1fr_auto]" key={log.id}>
          <div>
            <p className="font-semibold text-ink">{log.action}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">
              {log.performedBy ?? "system"} -> {log.target ?? "unknown"}
            </p>
          </div>
          <time className="font-mono text-xs text-slate-500">
            {new Date(log.timestamp).toLocaleString()}
          </time>
        </article>
      ))}
      {logs.length === 0 ? (
        <div className="p-6 text-sm text-slate-500">No audit events found.</div>
      ) : null}
    </div>
  </section>
);
