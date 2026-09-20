"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AccessGate } from "@/components/AccessGate";
import { LoadState, PageFrame } from "@/components/share/PageFrame";
import { SavedLesson } from "@/components/share/SavedLesson";
import { ShareButton } from "@/components/share/ShareButton";
import { useAuth } from "@/lib/auth-context";
import { getStashEntry, removeFromStash } from "@/lib/firestore";
import { useLoad } from "@/lib/useLoad";

function StashedLesson({ uid, id }: { uid: string; id: string }) {
  const router = useRouter();
  const state = useLoad(`stash-${uid}-${id}`, () => getStashEntry(uid, id));
  const [removeError, setRemoveError] = useState<string | null>(null);

  async function remove() {
    setRemoveError(null);
    try {
      await removeFromStash(uid, id);
      router.push("/library");
    } catch (err) {
      console.error("Failed to remove from stash:", err);
      setRemoveError(err instanceof Error ? err.message : "Couldn't remove this lesson.");
    }
  }

  return (
    <LoadState state={state} notFound="That lesson isn't in your stash.">
      {(entry) => (
        <SavedLesson
          lesson={entry.lesson}
          byline={entry.sharedBy ? `Shared by ${entry.sharedBy}` : "Shared with you"}
          actions={
            <>
              <ShareButton title={entry.title} ownerName={entry.sharedBy} resolveShareId={async () => entry.id} />
              <button type="button" onClick={remove} className="text-xs font-medium text-fg-muted underline decoration-border underline-offset-2 hover:text-accent">
                Remove from stash
              </button>
              {removeError && <span role="alert" className="text-xs text-rust">{removeError}</span>}
            </>
          }
        />
      )}
    </LoadState>
  );
}

export default function StashPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  return (
    <AccessGate>
      <PageFrame>{user && <StashedLesson uid={user.uid} id={id} />}</PageFrame>
    </AccessGate>
  );
}
