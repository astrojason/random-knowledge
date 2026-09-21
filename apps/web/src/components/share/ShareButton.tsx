"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createShare } from "@/lib/firestore";
import { shareMessage, shareUrl } from "@/lib/share";
import type { Lesson } from "@/lib/types";

const iconButtonClass = "inline-flex size-8 items-center justify-center rounded-sm text-fg-muted hover:bg-accent-soft hover:text-accent disabled:opacity-60";

/** The standard "share" glyph: a tray with an arrow leaving it. */
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-5">
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v13" />
    </svg>
  );
}

/** Shares via the native share sheet where available, otherwise copies the link. */
export function ShareButton({
  title,
  ownerName,
  resolveShareId,
}: {
  title: string;
  ownerName: string | null;
  resolveShareId: () => Promise<string>;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  async function share() {
    setBusy(true);
    setMessage(null);
    try {
      const url = shareUrl(window.location.origin, await resolveShareId());
      if (navigator.share) {
        await navigator.share({ title, text: shareMessage(title, ownerName), url });
      } else {
        await navigator.clipboard.writeText(`${shareMessage(title, ownerName)} ${url}`);
        setMessage({ text: "Link copied — paste it to a friend.", isError: false });
      }
    } catch (err) {
      // Dismissing the native share sheet rejects with AbortError; that's not a failure.
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Share failed:", err);
      setMessage({ text: err instanceof Error ? err.message : "Couldn't share this lesson.", isError: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={share} disabled={busy} aria-label="Share this lesson" title="Share this lesson" className={iconButtonClass}>
        <ShareIcon />
      </button>
      {message && (
        <span role={message.isError ? "alert" : "status"} className={message.isError ? "text-xs text-rust" : "text-xs text-fg-muted"}>
          {message.text}
        </span>
      )}
    </span>
  );
}

/** Share one of the signed-in user's own lessons. */
export function ShareLessonButton({ lesson, date }: { lesson: Lesson; date: string }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <ShareButton
      title={lesson.title}
      ownerName={user.displayName}
      resolveShareId={() => createShare(user, date, lesson)}
    />
  );
}
