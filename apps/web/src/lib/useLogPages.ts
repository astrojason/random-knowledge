"use client";

import { useState } from "react";
import { PAGE_SIZE } from "@/lib/pagination";
import { useLoad } from "@/lib/useLoad";

/**
 * Pages a newest-first log by cursor. `fetchPage` gets one more row than a page holds, so a full
 * extra row means there is a next page; the cursor for each page is the previous page's last `createdAt`.
 */
export function useLogPages<T extends { createdAt: string }>(
  key: string,
  fetchPage: (size: number, after: string | null) => Promise<T[]>
) {
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [page, setPage] = useState(0);
  const cursor = cursors[page];
  const state = useLoad(`${key}:${cursor ?? "newest"}`, () => fetchPage(PAGE_SIZE + 1, cursor));

  const entries = state.data?.slice(0, PAGE_SIZE) ?? null;
  const hasNext = (state.data?.length ?? 0) > PAGE_SIZE;

  function next() {
    if (!entries?.length) return;
    setCursors([...cursors.slice(0, page + 1), entries[entries.length - 1].createdAt]);
    setPage(page + 1);
  }

  return {
    loading: state.loading,
    error: state.error,
    entries,
    pagination: { page, hasPrev: page > 0, hasNext, onPrev: () => setPage(page - 1), onNext: next },
  };
}
