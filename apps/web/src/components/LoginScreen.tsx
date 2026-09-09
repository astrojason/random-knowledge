"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function LoginScreen() {
  const { signIn, error } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-surface px-8 py-10 text-center shadow-sm">
        <h1 className="mb-2 font-heading text-2xl font-bold text-fg-strong">Daily Lesson</h1>
        <p className="mb-6 text-sm text-fg-muted">Sign in to pick up your streak.</p>
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
