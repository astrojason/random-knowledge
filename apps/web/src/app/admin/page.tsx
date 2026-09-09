"use client";

import { useEffect, useState } from "react";
import { AccessPending } from "@/components/AccessPending";
import { LandingPage } from "@/components/LandingPage";
import { LoadingView } from "@/components/lesson/LoadingView";
import { Card } from "@/components/lesson/Card";
import { AdminAccessList } from "@/components/admin/AdminAccessList";
import { useAuth } from "@/lib/auth-context";
import { isSuperadmin, requestsForAdmin, type AccessRequest } from "@/lib/auth-guard";
import { grantAccess, listAccessRequests, revokeAccess } from "@/lib/firestore";

export default function AdminPage() {
  const { user, claims, loading } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const superadmin = isSuperadmin(claims);

  useEffect(() => {
    if (!superadmin) return;
    listAccessRequests()
      .then(setRequests)
      .catch((err) => {
        console.error("Failed to load access requests", err);
        setError(err instanceof Error ? err.message : "Failed to load access requests");
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
      setError(err instanceof Error ? err.message : "Failed to grant access");
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
      setError(err instanceof Error ? err.message : "Failed to revoke access");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 py-10">
      <Card>
        <h1 className="mb-5 font-heading text-xl font-bold text-fg-strong">Manage access</h1>
        {error && <p className="mb-4 text-sm text-rust">{error}</p>}
        {requests === null ? (
          <LoadingView text="Loading requests" />
        ) : (
          <AdminAccessList
            requests={requestsForAdmin(requests, user.uid)}
            onGrant={handleGrant}
            onRevoke={handleRevoke}
          />
        )}
      </Card>
    </div>
  );
}
