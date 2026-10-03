"use client";

import { useState } from "react";
import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { PAGE_SIZE } from "@/lib/pagination";

export interface LinkItem {
  key: string;
  href: string;
  title: string;
  detail: string;
}

export function PagedLinkList({ items }: { items: LinkItem[] }) {
  const [page, setPage] = useState(0);
  const visible = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <ul className="space-y-2">
        {visible.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="block rounded-sm border border-border px-3.5 py-2.5 text-sm hover:border-accent">
              <span className="font-semibold text-fg-strong">{item.title}</span>
              <span className="block text-xs text-fg-muted">{item.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        hasPrev={page > 0}
        hasNext={(page + 1) * PAGE_SIZE < items.length}
        onPrev={() => setPage(page - 1)}
        onNext={() => setPage(page + 1)}
      />
    </div>
  );
}
