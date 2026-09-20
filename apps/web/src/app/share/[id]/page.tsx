"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AccessGate } from "@/components/AccessGate";
import { LoadState, PageFrame } from "@/components/share/PageFrame";
import { SavedLesson } from "@/components/share/SavedLesson";
import { ShareButton } from "@/components/share/ShareButton";
import { ShareInvite } from "@/components/share/ShareInvite";
import { useAuth } from "@/lib/auth-context";
import { addToStash, getShare, getStashEntry } from "@/lib/firestore";
import type { SharedLesson } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";

const buttonClass = "rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-85 disabled:opacity-60";

function StashAction({ uid, share }: { uid: string; share: SharedLesson }) {
  const existing = useLoad(`stashed-${uid}-${share.id}`, async () => Boolean(await getStashEntry(uid, share.id)));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await addToStash(uid, share);
      setSaved(true);
    } catch (err) {
      console.error("Failed to add to stash:", err);
      setError(err instanceof Error ? err.message : "Couldn't add this lesson to your stash.");
    } finally {
      setSaving(false);
    }
  }

  if (existing.error) return <span role="alert" className="text-xs text-rust">{existing.error}</span>;
  if (existing.loading) return null;
  if (saved || existing.data) {
    return (
      <span className="text-sm text-fg-muted">
        In your stash. <Link href="/library" className="text-accent underline">Browse your library</Link>
      </span>
    );
  }
  return (
    <>
      <button type="button" onClick={save} disabled={saving} className={buttonClass}>
        Add to my stash
      </button>
      {error && <span role="alert" className="text-xs text-rust">{error}</span>}
    </>
  );
}

function SharedLessonView({ uid, id }: { uid: string; id: string }) {
  const state = useLoad(`share-${id}`, () => getShare(id));
  return (
    <LoadState state={state} notFound="This shared lesson doesn't exist or was removed.">
      {(share) => (
        <SavedLesson
          lesson={share.lesson}
          byline={share.ownerName ? `Shared by ${share.ownerName}` : "Shared with you"}
          actions={
            <>
              <StashAction uid={uid} share={share} />
              <ShareButton title={share.title} ownerName={share.ownerName} resolveShareId={async () => share.id} />
            </>
          }
        />
      )}
    </LoadState>
  );
}

export default function SharePage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  return (
    <AccessGate signedOut={<ShareInvite id={id} />}>
      <PageFrame>{user && <SharedLessonView uid={user.uid} id={id} />}</PageFrame>
    </AccessGate>
  );
}
