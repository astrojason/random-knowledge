import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAccessRequestAdmin, verifyIdToken } from "@/lib/firebase-admin";
import { hasAppAccess, isSuperadmin, resolveAccess } from "@/lib/auth-guard";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { generateSourcedLesson } from "@/lib/lesson-generation";

export const dynamic = "force-dynamic";

const TOKEN_TRACKER = "https://token-tracker-roan.vercel.app/api/tokens";
const DAILY_TOKEN_LIMIT = 250_000;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_RESEARCH_MODEL = process.env.OPENAI_RESEARCH_MODEL || "gpt-4.1";

// Constructed lazily (not at module load) since OPENAI_API_KEY is only
// available at runtime, not during the build's page-data collection step.
let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

async function getTokensUsedToday(): Promise<number> {
  const res = await fetch(TOKEN_TRACKER);
  const { tokens } = (await res.json()) as { tokens: number };
  return tokens;
}

async function reportTokensUsed(count: number): Promise<void> {
  await fetch(TOKEN_TRACKER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens: count }),
  });
}

export async function POST(request: Request) {
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

  let category: CategoryKey;
  let recentTitles: string[];
  try {
    const body = await request.json();
    if (typeof body.category !== "string" || !Object.hasOwn(CATEGORIES, body.category)) {
      return NextResponse.json({ error: `Unknown category: ${body.category}` }, { status: 400 });
    }
    category = body.category;
    recentTitles = Array.isArray(body.recentTitles)
      ? body.recentTitles.filter((title: unknown): title is string => typeof title === "string").slice(-12).map((title: string) => title.slice(0, 200))
      : [];
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const used = await getTokensUsedToday().catch(() => 0);
  if (used >= DAILY_TOKEN_LIMIT) {
    return NextResponse.json(
      { error: `Daily token limit reached (${used.toLocaleString()} / ${DAILY_TOKEN_LIMIT.toLocaleString()})` },
      { status: 429 }
    );
  }

  try {
    const generated = await generateSourcedLesson(getOpenAI(), {
      category,
      recentTitles,
      model: OPENAI_MODEL,
      researchModel: OPENAI_RESEARCH_MODEL,
      onTokens: async (count) => {
        await reportTokensUsed(count).catch((err) => console.error("Failed to report lesson tokens", err));
      },
    });
    return NextResponse.json({ category, ...generated });
  } catch (err) {
    console.error("Source-backed lesson generation failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create a sourced lesson. Please try again." },
      { status: 502 }
    );
  }
}
