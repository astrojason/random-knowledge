"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLink } from "@/components/AdminLink";

export function HeaderMenu({
  showAdminLink,
  showCategoriesSetting,
  categoryCount,
  onEditCategories,
}: {
  showAdminLink?: boolean;
  showCategoriesSetting: boolean;
  categoryCount: number;
  onEditCategories: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open menu"
        className="text-fg-muted hover:text-accent"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-5">
          <path d="M3 5.5h14M3 10h14M3 14.5h14" />
        </svg>
      </button>

      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-fg/40 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] border-l border-border bg-surface p-5 shadow-lg transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="font-heading text-lg font-semibold text-fg-strong">Menu</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="text-fg-muted hover:text-accent">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-5">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-3 border-b border-border pb-4">
          <Link href="/library" className="text-sm font-medium text-fg hover:text-accent">
            Library
          </Link>
          {showAdminLink && <AdminLink />}
        </nav>

        {showCategoriesSetting && (
          <div className="pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">Settings</h3>
            <button
              type="button"
              onClick={() => {
                onEditCategories();
                setOpen(false);
              }}
              className="text-sm font-semibold text-accent underline"
            >
              My categories ({categoryCount})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
