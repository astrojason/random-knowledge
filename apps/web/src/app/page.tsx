"use client";

import { AccessPending } from "@/components/AccessPending";
import { LoginScreen } from "@/components/LoginScreen";
import { DailyLesson } from "@/components/lesson/DailyLesson";
import { useAuth } from "@/lib/auth-context";
import { hasAppAccess } from "@/lib/auth-guard";
import { useAccessStatus } from "@/lib/useAccessStatus";
import { LoadingView } from "@/components/lesson/LoadingView";

export default function Home() {
  const { user, claims, loading } = useAuth();
  const { status, loading: accessLoading } = useAccessStatus(user, claims);

  if (loading || (user && accessLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingView text="Loading" />
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  if (!hasAppAccess(status ?? "pending")) {
    return <AccessPending status={status === "revoked" ? "revoked" : "pending"} />;
  }

  return <DailyLesson />;
}
