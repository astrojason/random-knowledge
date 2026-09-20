"use client";

import { AccessGate } from "@/components/AccessGate";
import { DailyLesson } from "@/components/lesson/DailyLesson";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user } = useAuth();
  return (
    <AccessGate>
      <DailyLesson key={user?.uid} />
    </AccessGate>
  );
}
