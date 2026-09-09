"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getAccessRequest, recordAccessRequest } from "@/lib/firestore";
import { isSuperadmin, resolveAccess, type AuthClaims, type ResolvedAccess } from "@/lib/auth-guard";

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
    // Intentional: resolve this user's access status (and record that they
    // showed up) whenever the signed-in user or their claims change. This is
    // a genuine remote-data fetch keyed off `user`/`claims`, not derived
    // state — see https://react.dev/learn/you-might-not-need-an-effect#fetching-data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resolve();
  }, [resolve]);

  return { status, loading };
}
