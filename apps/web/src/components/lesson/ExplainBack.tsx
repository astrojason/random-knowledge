"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Lesson } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";

const MIN_LENGTH = 20;
const MAX_LENGTH = 1500;
const buttonClass = "rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-85 disabled:opacity-50";

async function requestJson(path: string, token: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init?.body && { "Content-Type": "application/json" }) } });
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/** Offered only while the server says enough of the day's tokens remain; otherwise it renders nothing. */
export function ExplainBack({ lesson }: { lesson: Lesson }) {
  const { user } = useAuth();
  const availability = useLoad(`explain-back-${user?.uid}`, async () => {
    if (!user) return false;
    const data = await requestJson("/api/explain-back", await user.getIdToken());
    return data.available === true;
  });
  if (!availability.data) return null;
  return user ? <ExplainBackForm lesson={lesson} getToken={() => user.getIdToken()} /> : null;
}

function ExplainBackForm({ lesson, getToken }: { lesson: Lesson; getToken: () => Promise<string> }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const data = await requestJson("/api/explain-back", await getToken(), {
        method: "POST",
        body: JSON.stringify({ title: lesson.title, body: lesson.body, explanation: text.trim() }),
      });
      setFeedback(data.feedback);
    } catch (err) {
      console.error("Explain-back failed:", err);
      setError(err instanceof Error ? err.message : "Could not get feedback.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="mb-5 text-center">
        <button type="button" onClick={() => setOpen(true)} className="rounded-sm border border-border px-5 py-2.5 text-sm font-semibold text-fg-muted transition-opacity hover:opacity-85">
          Explain it back
        </button>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-sm border border-border bg-surface-raised p-4 text-left">
      <label htmlFor="explain-back" className="mb-2 block text-[13.5px] text-fg-muted">
        In your own words, what&apos;s the main idea? Explaining it is one of the best ways to remember it.
      </label>
      <textarea
        id="explain-back"
        value={text}
        maxLength={MAX_LENGTH}
        rows={4}
        onChange={(e) => setText(e.target.value)}
        className="mb-3 block w-full rounded-sm border border-border bg-surface p-2.5 text-sm text-fg"
      />
      {error && <p role="alert" className="mb-3 text-sm text-rust">{error}</p>}
      {feedback && <p className="mb-3 text-[14.5px] leading-relaxed text-fg">{feedback}</p>}
      <button type="button" disabled={busy || text.trim().length < MIN_LENGTH} onClick={submit} className={buttonClass}>
        {busy ? "Thinking…" : feedback ? "Get feedback again" : "Get feedback"}
      </button>
    </div>
  );
}
