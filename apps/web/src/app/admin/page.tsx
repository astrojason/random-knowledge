"use client";

import { useEffect, useState } from "react";
import { AccessPending } from "@/components/AccessPending";
import { LandingPage } from "@/components/LandingPage";
import { LoadingView } from "@/components/lesson/LoadingView";
import { Card } from "@/components/lesson/Card";
import { AdminAccessList } from "@/components/admin/AdminAccessList";
import { CronRunLog } from "@/components/admin/CronRunLog";
import { GenerationLog } from "@/components/admin/GenerationLog";
import { useAuth } from "@/lib/auth-context";
import { isSuperadmin, requestsForAdmin, type AccessRequest } from "@/lib/auth-guard";
import { grantAccess, listAccessRequests, listCronRunLog, listGenerationLog, revokeAccess } from "@/lib/firestore";
import type { CronRunLogEntry, GenerationLogEntry } from "@/lib/types";

export default function AdminPage() {
  const { user, claims, loading } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[] | null>(null);
  const [log, setLog] = useState<GenerationLogEntry[] | null>(null);
  const [runLog, setRunLog] = useState<CronRunLogEntry[] | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [logError, setLogError] = useState<string | null>(null);
  const [runLogError, setRunLogError] = useState<string | null>(null);

  const superadmin = isSuperadmin(claims);

  useEffect(() => {
    if (!superadmin) return;
    listAccessRequests()
      .then(setRequests)
      .catch((err) => {
        console.error("Failed to load access requests", err);
        setAccessError(err instanceof Error ? err.message : "Failed to load access requests");
      });
    listGenerationLog()
      .then(setLog)
      .catch((err) => {
        console.error("Failed to load the generation log", err);
        setLogError(err instanceof Error ? err.message : "Failed to load the generation log");
      });
    listCronRunLog()
      .then(setRunLog)
      .catch((err) => {
        console.error("Failed to load the cron run log", err);
        setRunLogError(err instanceof Error ? err.message : "Failed to load the cron run log");
      });
  }, [superadmin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingView text="Loading" />
      </div>
    );
  }
  if (!user) return <LandingPage />;
  if (!superadmin) return <AccessPending status="pending" />;

  const handleGrant = async (uid: string) => {
    try {
      await grantAccess(uid, user.uid);
      setRequests((prev) =>
        prev?.map((r) => (r.uid === uid ? { ...r, status: "granted" } : r)) ?? null
      );
    } catch (err) {
      console.error("Failed to grant access", err);
      setAccessError(err instanceof Error ? err.message : "Failed to grant access");
    }
  };

  const handleRevoke = async (uid: string) => {
    try {
      await revokeAccess(uid);
      setRequests((prev) =>
        prev?.map((r) => (r.uid === uid ? { ...r, status: "revoked" } : r)) ?? null
      );
    } catch (err) {
      console.error("Failed to revoke access", err);
      setAccessError(err instanceof Error ? err.message : "Failed to revoke access");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10">
      <Card>
        <h1 className="mb-5 font-heading text-xl font-bold text-fg-strong">Manage access</h1>
        {requests === null ? (
          accessError ? <p className="text-sm text-rust">{accessError}</p> : <LoadingView text="Loading requests" />
        ) : (
          <>
            {accessError && <p className="mb-4 text-sm text-rust">{accessError}</p>}
            <AdminAccessList
              requests={requestsForAdmin(requests, user.uid)}
              onGrant={handleGrant}
              onRevoke={handleRevoke}
            />
          </>
        )}
      </Card>
      <div className="mt-6">
        <Card>
          <h2 className="mb-5 font-heading text-xl font-bold text-fg-strong">Generation log</h2>
          {log === null ? (
            logError ? <p className="text-sm text-rust">{logError}</p> : <LoadingView text="Loading generation log" />
          ) : (
            <GenerationLog entries={log} requests={requests ?? []} />
          )}
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <h2 className="mb-5 font-heading text-xl font-bold text-fg-strong">Cron run log</h2>
          {runLog === null ? (
            runLogError ? <p className="text-sm text-rust">{runLogError}</p> : <LoadingView text="Loading cron run log" />
          ) : (
            <CronRunLog entries={runLog} requests={requests ?? []} />
          )}
        </Card>
      </div>
    </div>
  );
}
