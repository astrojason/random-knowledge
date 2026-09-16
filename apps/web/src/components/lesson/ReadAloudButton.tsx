"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  const browserSpeechSupported = useSyncExternalStore(noopSubscribe, getSupportSnapshot, getServerSupportSnapshot);
  const supported = Boolean(lesson.audioUrl) || browserSpeechSupported;
  const [state, setState] = useState<PlaybackState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (!supported) return null;

  const speak = () => {
    if (lesson.audioUrl) {
      const audio = new Audio(lesson.audioUrl);
      audio.onended = () => setState("idle");
      audio.onerror = () => setState("idle");
      audioRef.current = audio;
      void audio.play();
    } else {
      const utterance = new SpeechSynthesisUtterance(buildLessonSpeechText(lesson));
      utterance.onend = () => setState("idle");
      utterance.onerror = () => setState("idle");
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
    setState("speaking");
  };

  const pause = () => {
    if (lesson.audioUrl) audioRef.current?.pause();
    else window.speechSynthesis.pause();
    setState("paused");
  };

  const resume = () => {
    if (lesson.audioUrl) void audioRef.current?.play();
    else window.speechSynthesis.resume();
    setState("speaking");
  };

  const stop = () => {
    if (lesson.audioUrl) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
    } else {
      window.speechSynthesis.cancel();
    }
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
            <button type="button" onClick={pause} className={linkClass}>
              Pause
            </button>
          ) : (
            <button type="button" onClick={resume} className={linkClass}>
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
