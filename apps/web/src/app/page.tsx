"use client";

import { AccessDenied } from "@/components/AccessDenied";
import { LoginScreen } from "@/components/LoginScreen";
import { DailyLesson } from "@/components/lesson/DailyLesson";
import { useAuth } from "@/lib/auth-context";
import { isAllowedUser } from "@/lib/auth-guard";
import { LoadingView } from "@/components/lesson/LoadingView";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingView text="Loading" />
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  if (!isAllowedUser(user)) return <AccessDenied />;

  return <DailyLesson />;
}
