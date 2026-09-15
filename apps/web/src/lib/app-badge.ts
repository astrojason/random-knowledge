type BadgingNavigator = Navigator & {
  setAppBadge?: (count?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

/** Reflects whether today's lesson is still pending on the installed app's icon, via the Badging API. */
export function syncAppBadge(pending: boolean): void {
  if (typeof navigator === "undefined") return;
  const nav = navigator as BadgingNavigator;
  const result = pending ? nav.setAppBadge?.(1) : nav.clearAppBadge?.();
  result?.catch((err) => console.error("Failed to update app badge:", err));
}
