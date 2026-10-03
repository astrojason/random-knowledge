"use client";

import { AccessGate } from "@/components/AccessGate";
import { PreReviewSetting } from "@/components/settings/PreReviewSetting";
import { PageFrame } from "@/components/share/PageFrame";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  return (
    <AccessGate>
      <PageFrame>
        <h1 className="mb-4 font-heading text-xl font-bold text-fg-strong">Settings</h1>
        {user && <PreReviewSetting uid={user.uid} />}
      </PageFrame>
    </AccessGate>
  );
}
