"use client";

import Link from "next/link";
import { AccessGate } from "@/components/AccessGate";
import { LoadState, PageFrame } from "@/components/share/PageFrame";
import { useAuth } from "@/lib/auth-context";
import { CATEGORIES } from "@/lib/categories";
import { formatDateLabel } from "@/lib/date";
import { getHistory, getStash } from "@/lib/firestore";
import { useLoad } from "@/lib/useLoad";

const rowClass = "block rounded-sm border border-border px-3.5 py-2.5 text-sm hover:border-accent";

function Library({ uid }: { uid: string }) {
  const state = useLoad(`library-${uid}`, async () => {
    const [history, stash] = await Promise.all([getHistory(uid), getStash(uid)]);
    return { history: [...history].reverse(), stash };
  });

  return (
    <LoadState state={state} notFound="Nothing here yet.">
      {({ history, stash }) => (
        <div>
          <h1 className="mb-3 font-heading text-xl font-bold text-fg-strong">Shared with you</h1>
          {stash.length === 0 ? (
            <p className="mb-6 text-sm text-fg-muted">Lessons friends share with you, and that you add to your stash, appear here.</p>
          ) : (
            <ul className="mb-6 space-y-2">
              {stash.map((entry) => (
                <li key={entry.id}>
                  <Link href={`/stash/${entry.id}`} className={rowClass}>
                    <span className="font-semibold text-fg-strong">{entry.title}</span>
                    <span className="block text-xs text-fg-muted">
                      {CATEGORIES[entry.category]}{entry.sharedBy ? ` · from ${entry.sharedBy}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <h1 className="mb-3 font-heading text-xl font-bold text-fg-strong">Your past lessons</h1>
          {history.length === 0 ? (
            <p className="text-sm text-fg-muted">Your lesson history will build up here.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((entry) => (
                <li key={entry.date}>
                  <Link href={`/lesson/${entry.date}`} className={rowClass}>
                    <span className="font-semibold text-fg-strong">{entry.title}</span>
                    <span className="block text-xs text-fg-muted">{formatDateLabel(entry.date)} · {CATEGORIES[entry.category]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </LoadState>
  );
}

export default function LibraryPage() {
  const { user } = useAuth();
  return (
    <AccessGate>
      <PageFrame>{user && <Library uid={user.uid} />}</PageFrame>
    </AccessGate>
  );
}
