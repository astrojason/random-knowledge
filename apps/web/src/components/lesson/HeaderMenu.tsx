"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLink } from "@/components/AdminLink";

export function HeaderMenu({
  showAdminLink,
  showCategoriesSetting,
  categoryCount,
  onEditCategories,
  preReviewEnabled = false,
  onTogglePreReview,
}: {
  showAdminLink?: boolean;
  showCategoriesSetting: boolean;
  categoryCount: number;
  onEditCategories: () => void;
  preReviewEnabled?: boolean;
  onTogglePreReview?: (enabled: boolean) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [preReviewError, setPreReviewError] = useState<string | null>(null);

  async function togglePreReview(enabled: boolean) {
    setPreReviewError(null);
    try {
      await onTogglePreReview?.(enabled);
    } catch (err) {
      console.error("Failed to save the pre-review setting:", err);
      setPreReviewError(err instanceof Error ? err.message : "Could not save this setting.");
    }
  }

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
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border bg-surface p-5 shadow-lg transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
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
            {onTogglePreReview && (
              <div className="mt-4">
                <label className="flex cursor-pointer items-start gap-2.5 text-sm text-fg">
                  <input
                    type="checkbox"
                    checked={preReviewEnabled}
                    onChange={(e) => void togglePreReview(e.target.checked)}
                    className="mt-0.5 size-4 accent-accent"
                  />
                  <span>
                    <span className="font-semibold">Pre-review</span>
                    <span className="block text-xs text-fg-muted">
                      Answer a couple of quick questions before reading. Even a wrong guess gets you thinking before you find the answer.
                    </span>
                  </span>
                </label>
                {preReviewError && (
                  <p role="alert" className="mt-1.5 text-xs text-rust">{preReviewError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
