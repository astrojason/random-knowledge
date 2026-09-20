"use client";

import type { ReactNode } from "react";
import { AccessPending } from "@/components/AccessPending";
import { LandingPage } from "@/components/LandingPage";
import { LoadingView } from "@/components/lesson/LoadingView";
import { useAuth } from "@/lib/auth-context";
import { hasAppAccess } from "@/lib/auth-guard";
import { useAccessStatus } from "@/lib/useAccessStatus";

// A signed-out visitor sees `signedOut` (the public landing page by default)
// immediately — including while Firebase Auth is still initializing, since
// `user` starts out null either way — so Google's OAuth-verification crawler
// never sees a bare spinner in place of the app's purpose. The blocking
// spinner is reserved for the already-signed-in path, where we're waiting on
// that user's access status.
export function AccessGate({ children, signedOut = <LandingPage /> }: { children: ReactNode; signedOut?: ReactNode }) {
  const { user, claims } = useAuth();
  const { status, loading } = useAccessStatus(user, claims);

  if (!user) return <>{signedOut}</>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingView text="Loading" />
      </div>
    );
  }

  if (!hasAppAccess(status ?? "pending")) {
    return <AccessPending status={status === "revoked" ? "revoked" : "pending"} />;
  }

  return <>{children}</>;
}
