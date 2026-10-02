import type { AccessRequest } from "./auth-guard";
import type { HistoryEntry } from "./types";

/** On unless a superadmin explicitly turned it off; users without an access record (e.g. admins) are never paused. */
export function autoGenerationEnabled(request: AccessRequest | null | undefined): boolean {
  return request?.autoGeneration !== false;
}

/**
 * For a user with auto generation off, the date of the last lesson generated for them, which is shown
 * as today's lesson. Null when generation is on, or when they've never had a lesson (so they still get a first one).
 */
export function pausedFallbackDate(request: AccessRequest | null | undefined, history: HistoryEntry[]): string | null {
  if (autoGenerationEnabled(request)) return null;
  return history.at(-1)?.date ?? null;
}
