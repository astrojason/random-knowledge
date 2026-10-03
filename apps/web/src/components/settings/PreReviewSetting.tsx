"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { LoadState } from "@/components/share/PageFrame";
import { getPreReviewEnabled, setPreReviewEnabled } from "@/lib/firestore";
import { useLoad } from "@/lib/useLoad";

export function PreReviewSetting({ uid }: { uid: string }) {
  const saved = useLoad(`pre-review-${uid}`, () => getPreReviewEnabled(uid));
  return (
    <LoadState state={{ ...saved, data: saved.data === null ? null : { enabled: saved.data } }} notFound="Could not load this setting.">
      {({ enabled }) => <PreReviewSwitch uid={uid} initial={enabled} />}
    </LoadState>
  );
}

function PreReviewSwitch({ uid, initial }: { uid: string; initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  async function toggle(next: boolean) {
    setError(null);
    try {
      await setPreReviewEnabled(uid, next);
      setEnabled(next);
      toast(next ? "Pre-review turned on." : "Pre-review turned off.");
    } catch (err) {
      console.error("Failed to save the pre-review setting:", err);
      setError(err instanceof Error ? err.message : "Could not save this setting.");
    }
  }

  return (
    <div>
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-fg">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => void toggle(e.target.checked)}
          className="mt-0.5 size-4 accent-accent"
        />
        <span>
          <span className="font-semibold">Pre-review</span>
          <span className="block text-xs text-fg-muted">
            Answer a couple of quick questions before reading. Even a wrong guess gets you thinking before you find the answer.
          </span>
        </span>
      </label>
      {error && <p role="alert" className="mt-1.5 text-xs text-rust">{error}</p>}
    </div>
  );
}
