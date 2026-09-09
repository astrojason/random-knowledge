"use client";

import type { AccessRequest } from "@/lib/auth-guard";

export function AdminAccessList({
  requests,
  onGrant,
  onRevoke,
}: {
  requests: AccessRequest[];
  onGrant: (uid: string) => void;
  onRevoke: (uid: string) => void;
}) {
  if (requests.length === 0) {
    return <p className="text-sm text-fg-muted">No access requests yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {requests.map((req) => (
        <li
          key={req.uid}
          className="flex items-center justify-between rounded-sm border border-border bg-surface-raised px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-fg">{req.displayName ?? req.email ?? req.uid}</p>
            <p className="text-xs text-fg-muted">
              {req.email} · <span className="capitalize">{req.status}</span>
            </p>
          </div>
          {req.status === "granted" ? (
            <button
              type="button"
              onClick={() => onRevoke(req.uid)}
              className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-fg-muted hover:opacity-85"
            >
              Revoke
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onGrant(req.uid)}
              className="rounded-sm bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg hover:opacity-85"
            >
              Grant
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
