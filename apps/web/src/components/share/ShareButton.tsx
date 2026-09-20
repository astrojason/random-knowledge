"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createShare } from "@/lib/firestore";
import { shareMessage, shareUrl } from "@/lib/share";
import type { Lesson } from "@/lib/types";

const linkClass = "text-xs font-medium text-fg-muted underline decoration-border decoration-1 underline-offset-2 hover:text-accent disabled:opacity-60";

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
      <button type="button" onClick={share} disabled={busy} className={linkClass}>
        Share with a friend
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
