"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { AdminAccessList } from "@/components/admin/AdminAccessList";
import { LoadingView } from "@/components/lesson/LoadingView";
import { useAuth } from "@/lib/auth-context";
import { requestsForAdmin, type AccessRequest } from "@/lib/auth-guard";
import { grantAccess, listAccessRequests, revokeAccess, setAutoGeneration } from "@/lib/firestore";

export default function AdminAccessPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState<AccessRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAccessRequests()
      .then(setRequests)
      .catch((err) => {
        console.error("Failed to load access requests", err);
        setError(err instanceof Error ? err.message : "Failed to load access requests");
      });
  }, []);

  if (!user) return null;

  /** Saves a change to one request, then mirrors it locally; failures are logged and shown. */
  async function change(uid: string, save: () => Promise<void>, patch: Partial<AccessRequest>, failure: string, confirmation: string) {
    try {
      await save();
      toast(confirmation);
      setRequests((prev) => prev?.map((r) => (r.uid === uid ? { ...r, ...patch } : r)) ?? null);
    } catch (err) {
      console.error(failure, err);
      setError(err instanceof Error ? err.message : failure);
    }
  }

  return (
    <div>
      <h1 className="mb-5 font-heading text-xl font-bold text-fg-strong">Manage access</h1>
      {error && <p role="alert" className="mb-4 text-sm text-rust">{error}</p>}
      {requests === null ? (
        !error && <LoadingView text="Loading requests" />
      ) : (
        <AdminAccessList
          requests={requestsForAdmin(requests, user.uid)}
          onGrant={(uid) => change(uid, () => grantAccess(uid, user.uid), { status: "granted" }, "Failed to grant access", "Access granted.")}
          onRevoke={(uid) => change(uid, () => revokeAccess(uid), { status: "revoked" }, "Failed to revoke access", "Access revoked.")}
          onToggleAutoGeneration={(uid, enabled) =>
            change(uid, () => setAutoGeneration(uid, enabled), { autoGeneration: enabled }, "Failed to change auto generation",
              enabled ? "Auto lessons turned on." : "Auto lessons turned off.")}
        />
      )}
    </div>
  );
}
