"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { CATEGORIES } from "@/lib/categories";

const FEATURES = [
  {
    title: "A new topic every day",
    body: "Each day brings one short, AI-written lesson on a specific, narrow topic — never a broad overview you've seen before.",
  },
  {
    title: "A quick comprehension check",
    body: "A 3-question quiz right after the lesson checks what stuck, with a short explanation for each answer.",
  },
  {
    title: "Six categories to explore",
    body: `From ${Object.values(CATEGORIES).slice(0, -1).join(", ")}, and ${Object.values(CATEGORIES).at(-1)?.toLowerCase()}.`,
  },
  {
    title: "Your streak, tracked",
    body: "Come back daily and Daily Lesson keeps count, so your learning habit builds visible momentum.",
  },
];

export function LandingPage() {
  const { signIn, error } = useAuth();

  return (
    <div className="px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-2xl text-center">
        <h1 className="font-heading text-3xl font-bold text-fg-strong sm:text-4xl">
          Daily Lesson
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-fg-muted sm:text-lg">
          One short, AI-generated lesson a day — plus a quick quiz to check what stuck — so a
          five-minute habit turns into real, remembered knowledge.
        </p>
      </div>

      <div className="mx-auto mt-12 grid w-full max-w-2xl gap-5 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-md border border-border bg-surface p-5 text-left">
            <h2 className="font-heading text-base font-semibold text-fg-strong">{f.title}</h2>
            <p className="mt-1.5 text-sm text-fg-muted">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 w-full max-w-sm rounded-md border border-border bg-surface px-8 py-10 text-center shadow-sm">
        <p className="mb-6 text-sm text-fg-muted">
          Daily Lesson is currently invite-only. Sign in with Google to request access —
          you&apos;ll be able to use the app as soon as it&apos;s approved.
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
          By signing in you agree to the{" "}
          <Link href="/terms" className="text-accent hover:opacity-85">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-accent hover:opacity-85">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
