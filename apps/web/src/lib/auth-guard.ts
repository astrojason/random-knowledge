export type AccessStatus = "pending" | "granted" | "revoked";

export interface AccessRequest {
  uid: string;
  email: string | null;
  displayName: string | null;
  status: AccessStatus;
  firstSeenAt: string;
  lastSeenAt: string;
  grantedAt?: string;
  grantedBy?: string;
  revokedAt?: string;
}

export type ResolvedAccess = "superadmin" | "granted" | "pending" | "revoked" | "denied";

export interface AuthClaims {
  superadmin?: boolean;
}

export function isSuperadmin(claims: AuthClaims | null | undefined): boolean {
  return claims?.superadmin === true;
}

export function resolveAccess(
  uid: string | null,
  claims: AuthClaims | null,
  request: AccessRequest | null
): ResolvedAccess {
  if (!uid) return "denied";
  if (isSuperadmin(claims)) return "superadmin";
  if (!request) return "pending";
  return request.status;
}

export function hasAppAccess(resolved: ResolvedAccess): boolean {
  return resolved === "superadmin" || resolved === "granted";
}

/**
 * Excludes the viewer's own request from the admin list — a superadmin can
 * have a leftover accessRequests doc from before they were granted the
 * claim (their first sign-in recorded them as "pending"), which should
 * never show up as something for them to review.
 */
export function requestsForAdmin(requests: AccessRequest[], viewerUid: string): AccessRequest[] {
  return requests.filter((r) => r.uid !== viewerUid);
}
