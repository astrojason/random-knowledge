"use client";

import type { AccessRequest } from "@/lib/auth-guard";
import type { CronRunLogEntry } from "@/lib/types";
import { labelFor } from "./labelFor";

export function CronRunLog({ entries, requests }: { entries: CronRunLogEntry[]; requests: AccessRequest[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-fg-muted">No cron runs yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => {
        const failed = entry.results.filter((r) => r.status === "failed");
        const generated = entry.results.filter((r) => r.status === "generated").length;
        const alreadyHad = entry.results.filter((r) => r.status === "already-had-lesson").length;
        return (
          <li
            key={`${entry.date}-${entry.createdAt}`}
            className={`rounded-sm border px-4 py-3 text-sm ${failed.length > 0 ? "border-rust bg-rust-soft" : "border-border bg-surface-raised"}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-fg">Run for {entry.date}</span>
              <span className="text-xs text-fg-muted">{new Date(entry.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs text-fg-muted">
              {generated} generated · {alreadyHad} already had a lesson · {failed.length} failed
              {entry.stoppedForTokenLimit && " · stopped early (daily token limit reached)"}
            </p>
            {failed.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {failed.map((result) => (
                  <li key={result.uid} className="text-xs text-rust">
                    {labelFor(result.uid, requests)}: {result.error ?? "Unknown error"}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
