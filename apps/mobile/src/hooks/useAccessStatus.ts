import type { User } from "@firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { isSuperadmin, resolveAccess, type AuthClaims, type ResolvedAccess } from "@random-knowledge/shared/auth-guard";
import { getAccessRequest, recordAccessRequest } from "../lib/firestore";

export function useAccessStatus(user: User | null, claims: AuthClaims | null) {
  const [status, setStatus] = useState<ResolvedAccess | null>(null);
  const [loading, setLoading] = useState(true);
  // `user` and `claims` land in separate renders (see auth-context.tsx),
  // so this can be invoked again — with the real claims — before an
  // earlier claims=null resolution's Firestore round trip finishes. This
  // token makes a superseded resolution a no-op instead of letting it
  // overwrite a newer, already-applied result.
  const latestRequest = useRef(0);

  const resolve = useCallback(async () => {
    const requestId = ++latestRequest.current;
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
      if (requestId !== latestRequest.current) return;
      setStatus(resolveAccess(user.uid, claims, req));
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      console.error("Failed to resolve access status", err);
      setStatus("denied");
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [user, claims]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resolve();
  }, [resolve]);

  return { status, loading };
}
