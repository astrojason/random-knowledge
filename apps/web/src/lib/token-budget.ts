const TOKEN_TRACKER = "https://token-tracker-roan.vercel.app/api/tokens";

export const DAILY_TOKEN_LIMIT = 250_000;

export async function getTokensUsedToday(): Promise<number> {
  const res = await fetch(TOKEN_TRACKER);
  const { tokens } = (await res.json()) as { tokens: number };
  return tokens;
}

export async function reportTokensUsed(count: number): Promise<void> {
  await fetch(TOKEN_TRACKER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens: count }),
  });
}
