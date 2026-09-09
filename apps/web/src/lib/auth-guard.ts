import type { User } from "firebase/auth";

/**
 * Single-user allowlist (see setup-plan.md step 5 / TODO.md). Unset until the
 * real Firebase project is provisioned and Jason's UID is known — leaving it
 * unset lets any signed-in Google account through, which is fine only until then.
 */
export const ALLOWED_UID = process.env.NEXT_PUBLIC_ALLOWED_UID || null;

export function isAllowedUser(user: User | null): boolean {
  if (!user) return false;
  if (!ALLOWED_UID) return true;
  return user.uid === ALLOWED_UID;
}
