const TOKEN_TRACKER = "https://token-tracker-roan.vercel.app/api/tokens";

export const DAILY_TOKEN_LIMIT = 250_000;

/** Optional extras (explain-it-back) stop being offered below this, keeping the rest of the day's budget for lessons. */
export const OPTIONAL_FEATURE_MIN_REMAINING = 50_000;

/** The tracker couldn't say how much has been spent, so the budget can't be enforced. Callers must not treat this as zero usage. */
export class TokenTrackerError extends Error {
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.name = "TokenTrackerError";
  }
}

export async function getTokensUsedToday(): Promise<number> {
  try {
    const res = await fetch(TOKEN_TRACKER);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const { tokens } = (await res.json()) as { tokens?: unknown };
    if (typeof tokens !== "number" || !Number.isFinite(tokens)) throw new Error("the response had no token count");
    return tokens;
  } catch (err) {
    throw new TokenTrackerError(`Token tracker unreachable: ${err instanceof Error ? err.message : String(err)}`, { cause: err });
  }
}

/** Throws TokenTrackerError when usage can't be read, so callers fail closed instead of assuming the budget is unspent. */
export async function hasTokensRemaining(minimum: number): Promise<boolean> {
  return (await getTokensUsedToday()) + minimum <= DAILY_TOKEN_LIMIT;
}

export async function reportTokensUsed(count: number): Promise<void> {
  const res = await fetch(TOKEN_TRACKER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens: count }),
  });
  if (!res.ok) throw new Error(`Token tracker rejected the report (${res.status} ${res.statusText})`);
}
