import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getAccessRequestAdmin, verifyIdToken } from "@/lib/firebase-admin";
import { hasAppAccess, isSuperadmin, resolveAccess } from "@/lib/auth-guard";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import type { GeneratedLesson } from "@/lib/types";

export const dynamic = "force-dynamic";

const TOKEN_TRACKER = "https://token-tracker-roan.vercel.app/api/tokens";
const DAILY_TOKEN_LIMIT = 250_000;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

function buildPrompt(category: CategoryKey, recentTitles: string[]): string {
  const categoryNote =
    category === "advanced"
      ? " This category is for genuinely advanced, technical ideas (physics, math, cosmology, computer science theory, etc.) — do not water down the actual concept, but explain it ELI5-style with a clear, concrete analogy so a smart non-specialist can follow it."
      : "";

  return `Generate one short daily "curiosity lesson" for a general adult learner. Category: ${CATEGORIES[category]}.${categoryNote}

Avoid repeating any of these recent topics: ${recentTitles.length ? recentTitles.join("; ") : "(none yet)"}.

Requirements:
- Pick a specific, narrow, genuinely interesting subtopic within the category (not a broad overview).
- Write 3 short paragraphs (roughly 220-320 words total), engaging and clear, aimed at a curious adult. No headers within the body.
- Then write exactly 3 multiple-choice quiz questions testing comprehension of THIS specific lesson (not general trivia). Each question has exactly 4 options, one correct.
- Keep explanations for answers short (1 sentence).
- Also provide two short search phrases (3-6 words each) for someone who wants to go deeper: one to paste into Wikipedia search, one to paste into YouTube search. These must be plain search phrases, not URLs or claims about what a specific video/article contains.

Respond with ONLY raw JSON, in exactly this shape:
{
  "title": "string, under 60 chars",
  "body": ["paragraph1", "paragraph2", "paragraph3"],
  "wikiQuery": "string, short search phrase",
  "youtubeQuery": "string, short search phrase",
  "quiz": [
    {"question": "string", "options": ["a","b","c","d"], "correctIndex": 0, "explanation": "string"},
    {"question": "string", "options": ["a","b","c","d"], "correctIndex": 0, "explanation": "string"},
    {"question": "string", "options": ["a","b","c","d"], "correctIndex": 0, "explanation": "string"}
  ]
}`;
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
    if (!(body.category in CATEGORIES)) {
      return NextResponse.json({ error: `Unknown category: ${body.category}` }, { status: 400 });
    }
    category = body.category;
    recentTitles = Array.isArray(body.recentTitles) ? body.recentTitles : [];
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

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      max_tokens: 1400,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: buildPrompt(category, recentTitles) }],
    });
  } catch (err) {
    return NextResponse.json(
      { error: `OpenAI request failed: ${err instanceof Error ? err.message : "unknown error"}` },
      { status: 502 }
    );
  }

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    return NextResponse.json({ error: "OpenAI returned no content" }, { status: 502 });
  }

  let generated: GeneratedLesson;
  try {
    generated = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "OpenAI response was not valid JSON" }, { status: 502 });
  }

  const tokensUsed = completion.usage?.total_tokens ?? 0;
  await reportTokensUsed(tokensUsed).catch(() => {});

  return NextResponse.json({ category, ...generated });
}
