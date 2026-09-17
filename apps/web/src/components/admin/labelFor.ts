import type { AccessRequest } from "@/lib/auth-guard";

export function labelFor(uid: string, requests: AccessRequest[]): string {
  const req = requests.find((r) => r.uid === uid);
  return req?.displayName ?? req?.email ?? uid;
}
