import type { User } from "@firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { isSuperadmin, resolveAccess, type AuthClaims, type ResolvedAccess } from "@random-knowledge/shared/auth-guard";
import { getAccessRequest, recordAccessRequest } from "../lib/firestore";

export function useAccessStatus(user: User | null, claims: AuthClaims | null) {
  const [status, setStatus] = useState<ResolvedAccess | null>(null);
  const [loading, setLoading] = useState(true);

  const resolve = useCallback(async () => {
    if (!user) {
      setStatus(null);
      setLoading(false);
      return;
    }
    if (isSuperadmin(claims)) {
      setStatus("superadmin");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await recordAccessRequest(user);
      const req = await getAccessRequest(user.uid);
      setStatus(resolveAccess(user.uid, claims, req));
    } catch (err) {
      console.error("Failed to resolve access status", err);
      setStatus("denied");
    } finally {
      setLoading(false);
    }
  }, [user, claims]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resolve();
  }, [resolve]);

  return { status, loading };
}
