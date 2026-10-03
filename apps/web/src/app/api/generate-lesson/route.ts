import { NextResponse } from "next/server";
import OpenAI from "openai";
import { authorizeAppUser } from "@/lib/api-auth";
import { hasLessonHistoryAdmin, logGenerationAdmin } from "@/lib/firebase-admin";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { attachLessonAudio } from "@/lib/lesson-audio";
import { generateSourcedLesson } from "@/lib/lesson-generation";
import { autoGenerationEnabled } from "@/lib/paused-generation";
import { DAILY_TOKEN_LIMIT, getTokensUsedToday, reportTokensUsed } from "@/lib/token-budget";

export const dynamic = "force-dynamic";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_RESEARCH_MODEL = process.env.OPENAI_RESEARCH_MODEL || "gpt-4.1";

// Constructed lazily (not at module load) since OPENAI_API_KEY is only
// available at runtime, not during the build's page-data collection step.
let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

async function authorizeRequest(request: Request): Promise<NextResponse | { uid: string }> {
  const authorized = await authorizeAppUser(request);
  if (authorized instanceof NextResponse) return authorized;
  const { uid, accessRequest } = authorized;
  // A superadmin turned auto generation off: they keep their last lesson. Someone with no lesson yet still gets a first one.
  if (!autoGenerationEnabled(accessRequest) && (await hasLessonHistoryAdmin(uid))) {
    return NextResponse.json({ error: "Auto generation is turned off for this account" }, { status: 403 });
  }
  return { uid };
}

export async function POST(request: Request) {
  const authorized = await authorizeRequest(request);
  if (authorized instanceof NextResponse) return authorized;
  const { uid } = authorized;
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
      onTokens: reportTokensUsed,
    });
    const lesson = await attachLessonAudio(`lesson-audio/${uid}/${Date.now()}.mp3`, { category, ...generated });
    await logGenerationAdmin(uid, lesson.title, "on-access").catch((err) => console.error("Failed to log lesson generation", err));
    return NextResponse.json(lesson);
  } catch (err) {
    console.error("Source-backed lesson generation failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create a sourced lesson. Please try again." },
      { status: 502 }
    );
  }
}
