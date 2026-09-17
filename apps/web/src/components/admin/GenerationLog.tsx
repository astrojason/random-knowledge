"use client";

import type { AccessRequest } from "@/lib/auth-guard";
import type { GenerationLogEntry } from "@/lib/types";
import { labelFor } from "./labelFor";

export function GenerationLog({ entries, requests }: { entries: GenerationLogEntry[]; requests: AccessRequest[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-fg-muted">No lessons generated yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={`${entry.uid}-${entry.createdAt}`} className="rounded-sm border border-border bg-surface-raised px-4 py-3 text-sm text-fg">
          <span className="font-medium">{entry.title}</span> generated for {labelFor(entry.uid, requests)}
          <span className="block text-xs text-fg-muted">{new Date(entry.createdAt).toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}
