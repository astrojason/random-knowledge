"use client";

import type { ReactNode } from "react";
import { Pagination } from "@/components/Pagination";
import { LoadingView } from "@/components/lesson/LoadingView";
import type { AccessRequest } from "@/lib/auth-guard";
import { listAccessRequests } from "@/lib/firestore";
import { useLoad } from "@/lib/useLoad";
import { useLogPages } from "@/lib/useLogPages";

/** Shared shell of the paginated admin logs: loads one page, plus the people list used to label user ids. */
export function LogPage<T extends { createdAt: string }>({
  title,
  loadingText,
  fetchPage,
  children,
}: {
  title: string;
  loadingText: string;
  fetchPage: (size: number, after: string | null) => Promise<T[]>;
  children: (entries: T[], requests: AccessRequest[]) => ReactNode;
}) {
  const log = useLogPages(title, fetchPage);
  const people = useLoad("admin-people", listAccessRequests);

  return (
    <div>
      <h1 className="mb-5 font-heading text-xl font-bold text-fg-strong">{title}</h1>
      {log.error && <p role="alert" className="text-sm text-rust">{log.error}</p>}
      {people.error && <p role="alert" className="mb-3 text-xs text-rust">Could not load names, showing ids: {people.error}</p>}
      {log.loading && <LoadingView text={loadingText} />}
      {log.entries && (
        <>
          {children(log.entries, people.data ?? [])}
          <Pagination {...log.pagination} />
        </>
      )}
    </div>
  );
}
