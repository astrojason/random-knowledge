"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { CATEGORIES } from "@/lib/categories";
import type { SharePreview } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";

async function fetchPreview(id: string): Promise<SharePreview | null> {
  const res = await fetch(`/api/share/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/** What a friend without an account (or signed out) sees at a share link: a taste of the lesson and a way in. */
export function ShareInvite({ id }: { id: string }) {
  const { signIn, error } = useAuth();
  const { data: preview, error: previewError } = useLoad(`preview-${id}`, () => fetchPreview(id));

  return (
    <div className="px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-sm rounded-md border border-border bg-surface px-8 py-10 text-center shadow-sm">
        <h1 className="mb-2 font-heading text-xl font-bold text-fg-strong">
          {preview?.ownerName ? `${preview.ownerName} shared a lesson with you` : "You've been sent a lesson"}
        </h1>
        {preview && (
          <p className="mb-4 text-sm text-fg-muted">
            <span className="font-semibold text-fg-strong">{preview.title}</span>
            <span className="block text-xs">{CATEGORIES[preview.category]}</span>
          </p>
        )}
        {previewError && <p role="alert" className="mb-4 text-[13px] text-rust">{previewError}</p>}
        <p className="mb-6 text-sm text-fg-muted">
          Random Knowledge is an invite-only daily lesson with a quick quiz. Sign in with Google to read this lesson —
          if you&apos;re new, your access request goes out at the same time and you&apos;ll see the lesson once it&apos;s approved.
        </p>
        <button
          type="button"
          onClick={signIn}
          className="w-full rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-85"
        >
          Sign in with Google
        </button>
        {error && <p className="mt-4 text-[13px] text-rust">{error}</p>}
        <p className="mt-6 text-xs text-fg-muted">
          <Link href="/privacy" className="text-accent hover:opacity-85">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
