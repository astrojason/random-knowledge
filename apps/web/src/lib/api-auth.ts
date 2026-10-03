import { NextResponse } from "next/server";
import { getAccessRequestAdmin, verifyIdToken } from "@/lib/firebase-admin";
import { hasAppAccess, isSuperadmin, resolveAccess, type AccessRequest } from "@/lib/auth-guard";

/** Verifies the Bearer ID token and that the account has app access; otherwise returns the error response to send. */
export async function authorizeAppUser(request: Request): Promise<NextResponse | { uid: string; accessRequest: AccessRequest | null }> {
  const authHeader = request.headers.get("authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
  }
  let decoded;
  try {
    decoded = await verifyIdToken(idToken);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid auth token: ${err instanceof Error ? err.message : "unknown error"}` },
      { status: 401 }
    );
  }

  const claims = { superadmin: decoded.superadmin === true };
  const accessRequest = isSuperadmin(claims) ? null : await getAccessRequestAdmin(decoded.uid);
  if (!hasAppAccess(resolveAccess(decoded.uid, claims, accessRequest))) {
    return NextResponse.json({ error: "Access not granted for this account" }, { status: 403 });
  }
  return { uid: decoded.uid, accessRequest };
}
