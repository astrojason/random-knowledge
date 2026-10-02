/**
 * True for the 429 OpenAI returns when the account has no credits or quota left. Unlike an ordinary
 * rate limit, retrying can't succeed until someone adds credits. Duck-typed on `status`/`code`/`message`
 * so it doesn't depend on which copy of the SDK's error classes produced the error.
 */
export function isOutOfCredits(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const { status, code, message } = err as { status?: unknown; code?: unknown; message?: unknown };
  if (status !== 429) return false;
  return code === "insufficient_quota" || (typeof message === "string" && /no credits remaining|exceeded your current quota/i.test(message));
}
