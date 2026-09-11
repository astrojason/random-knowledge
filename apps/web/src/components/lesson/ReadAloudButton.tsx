"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { buildLessonSpeechText } from "@/lib/speech";
import type { Lesson } from "@/lib/types";

type PlaybackState = "idle" | "speaking" | "paused";

const linkClass = "text-xs font-medium text-fg-muted underline decoration-border decoration-1 underline-offset-2 hover:text-accent";

// Browser support never changes after load, so a no-op subscribe is fine — this only needs
// getServerSnapshot to differ from getSnapshot, so hydration matches the server's markup.
const noopSubscribe = () => () => {};
const getSupportSnapshot = () => typeof window !== "undefined" && "speechSynthesis" in window;
const getServerSupportSnapshot = () => false;

export function ReadAloudButton({ lesson }: { lesson: Lesson }) {
  const supported = useSyncExternalStore(noopSubscribe, getSupportSnapshot, getServerSupportSnapshot);
  const [state, setState] = useState<PlaybackState>("idle");

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (!supported) return null;

  const speak = () => {
    const utterance = new SpeechSynthesisUtterance(buildLessonSpeechText(lesson));
    utterance.onend = () => setState("idle");
    utterance.onerror = () => setState("idle");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setState("speaking");
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setState("idle");
  };

  return (
    <div className="mb-3 flex items-center gap-3">
      {state === "idle" && (
        <button type="button" onClick={speak} className={linkClass}>
          Listen to this lesson
        </button>
      )}
      {state !== "idle" && (
        <>
          {state === "speaking" ? (
            <button type="button" onClick={() => { window.speechSynthesis.pause(); setState("paused"); }} className={linkClass}>
              Pause
            </button>
          ) : (
            <button type="button" onClick={() => { window.speechSynthesis.resume(); setState("speaking"); }} className={linkClass}>
              Resume
            </button>
          )}
          <button type="button" onClick={stop} className={linkClass}>
            Stop
          </button>
        </>
      )}
    </div>
  );
}
