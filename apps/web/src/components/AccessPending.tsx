"use client";

import { useAuth } from "@/lib/auth-context";

export function AccessPending({ status }: { status: "pending" | "revoked" }) {
  const { user, signOut } = useAuth();

  const copy =
    status === "revoked"
      ? "Your access to this app has been revoked."
      : "Your access request has been sent. You'll be able to use the app once it's approved.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-sm rounded-md border border-border bg-surface px-8 py-10 shadow-sm">
        <h1 className="mb-2 font-heading text-xl font-bold text-fg-strong">
          {status === "revoked" ? "Access revoked" : "Access requested"}
        </h1>
        <p className="mb-4 text-sm text-fg-muted">
          {copy} Signed in as <span className="font-medium text-fg">{user?.email}</span>, uid{" "}
          <code className="rounded bg-surface-raised px-1 py-0.5 text-xs">{user?.uid}</code>.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-sm border border-border px-5 py-2.5 text-sm font-semibold text-fg-muted transition-opacity hover:opacity-85"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
