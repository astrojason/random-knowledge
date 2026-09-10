"use client";

import { AccessPending } from "@/components/AccessPending";
import { LandingPage } from "@/components/LandingPage";
import { DailyLesson } from "@/components/lesson/DailyLesson";
import { useAuth } from "@/lib/auth-context";
import { hasAppAccess } from "@/lib/auth-guard";
import { useAccessStatus } from "@/lib/useAccessStatus";
import { LoadingView } from "@/components/lesson/LoadingView";

// The public landing page (LandingPage) must render immediately for a
// signed-out visitor — including while Firebase Auth is still
// initializing, since `user` starts out null either way — so Google's
// OAuth-verification crawler never sees a bare spinner in place of the
// app's purpose. The blocking spinner is reserved for the
// already-signed-in path, where we're waiting on that user's access
// status.
export default function Home() {
  const { user, claims } = useAuth();
  const { status, loading: accessLoading } = useAccessStatus(user, claims);

  if (!user) return <LandingPage />;

  if (accessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingView text="Loading" />
      </div>
    );
  }

  if (!hasAppAccess(status ?? "pending")) {
    return <AccessPending status={status === "revoked" ? "revoked" : "pending"} />;
  }

  return <DailyLesson key={user.uid} />;
}
