import { NextResponse } from "next/server";
import OpenAI from "openai";
import { authorizeAppUser } from "@/lib/api-auth";
import { explainBackFeedback } from "@/lib/explain-back";
import { hasTokensRemaining, OPTIONAL_FEATURE_MIN_REMAINING, reportTokensUsed, TokenTrackerError } from "@/lib/token-budget";

export const dynamic = "force-dynamic";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const MAX_EXPLANATION = 1500;
const MAX_TITLE = 200;
const MAX_PARAGRAPH = 2000;
const MAX_PARAGRAPHS = 5;

// Constructed lazily since OPENAI_API_KEY is only available at runtime, not during the build.
let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

/** Whether enough of the day's tokens remain for this optional feature. A tracker outage is an error, never "plenty left". */
async function tokensAvailable(): Promise<boolean | NextResponse> {
  try {
    return await hasTokensRemaining(OPTIONAL_FEATURE_MIN_REMAINING);
  } catch (err) {
    if (!(err instanceof TokenTrackerError)) throw err;
    console.error("Explain-back: couldn't check today's token usage", err);
    return NextResponse.json({ error: "Couldn't check today's usage right now." }, { status: 503 });
  }
}

function parseBody(value: unknown): { title: string; body: string[]; explanation: string } | null {
  if (typeof value !== "object" || value === null) return null;
  const { title, body, explanation } = value as Record<string, unknown>;
  const validBody = Array.isArray(body) && body.length > 0 && body.length <= MAX_PARAGRAPHS &&
    body.every((paragraph) => typeof paragraph === "string" && paragraph.length <= MAX_PARAGRAPH);
  if (typeof title !== "string" || title.length > MAX_TITLE || !validBody) return null;
  if (typeof explanation !== "string" || !explanation.trim() || explanation.length > MAX_EXPLANATION) return null;
  return { title, body, explanation: explanation.trim() };
}

export async function GET(request: Request) {
  const authorized = await authorizeAppUser(request);
  if (authorized instanceof NextResponse) return authorized;
  const available = await tokensAvailable();
  if (available instanceof NextResponse) return available;
  return NextResponse.json({ available });
}

export async function POST(request: Request) {
  const authorized = await authorizeAppUser(request);
  if (authorized instanceof NextResponse) return authorized;

  const input = parseBody(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: "Write a short explanation of the lesson first." }, { status: 400 });

  const available = await tokensAvailable();
  if (available instanceof NextResponse) return available;
  if (!available) {
    return NextResponse.json({ error: "Feedback is paused for today to save tokens for tomorrow's lesson." }, { status: 429 });
  }

  try {
    const feedback = await explainBackFeedback(getOpenAI(), { ...input, model: OPENAI_MODEL, onTokens: reportTokensUsed });
    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("Explain-back feedback failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not get feedback. Please try again." }, { status: 502 });
  }
}
