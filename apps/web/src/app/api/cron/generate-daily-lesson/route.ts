import { NextResponse } from "next/server";
import OpenAI from "openai";
import { pickCategory } from "@/lib/categories";
import { todayStr } from "@/lib/date";
import { getDailyGenerationContextAdmin, listGrantedUserIds, saveDailyLessonAdmin } from "@/lib/firebase-admin";
import { attachLessonAudio } from "@/lib/lesson-audio";
import { generateSourcedLesson } from "@/lib/lesson-generation";
import { DAILY_TOKEN_LIMIT, getTokensUsedToday, reportTokensUsed } from "@/lib/token-budget";
import type { Lesson } from "@/lib/types";

export const dynamic = "force-dynamic";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OPENAI_RESEARCH_MODEL = process.env.OPENAI_RESEARCH_MODEL || "gpt-4.1";
const MAX_ATTEMPTS_PER_USER = 3;

// Constructed lazily (not at module load) since OPENAI_API_KEY is only
// available at runtime, not during the build's page-data collection step.
let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

function authorizeRequest(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("CRON_SECRET is not configured; refusing to run the daily-lesson cron.");
    return NextResponse.json({ error: "Cron is not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

async function tokenLimitReached(): Promise<boolean> {
  const used = await getTokensUsedToday().catch(() => 0);
  return used >= DAILY_TOKEN_LIMIT;
}

interface UserResult {
  uid: string;
  status: "generated" | "already-had-lesson" | "failed";
  error?: string;
}

/**
 * Pre-generates today's lesson for every user with granted access, so it's
 * ready before they open the app. Retries a user's generation (the research
 * + draft + source-review pipeline can fail transiently, e.g. a rejected
 * draft) up to MAX_ATTEMPTS_PER_USER times, but the whole run stops early
 * once the shared daily token budget is exhausted.
 *
 * Runs on the server with no per-user browser session, so "today" is
 * resolved in UTC rather than each user's local timezone (unlike the
 * client, which keys lessons off the browser's local date) — pre-generation
 * is best-effort, so a boundary mismatch just means a wasted generation,
 * never a wrong lesson served to a user.
 */
export async function POST(request: Request) {
  const denied = authorizeRequest(request);
  if (denied) return denied;

  const date = todayStr("UTC");
  const uids = await listGrantedUserIds();
  const results: UserResult[] = [];
  let stoppedForTokenLimit = false;

  for (const uid of uids) {
    if (await tokenLimitReached()) {
      stoppedForTokenLimit = true;
      break;
    }

    const context = await getDailyGenerationContextAdmin(uid, date);
    if (context.existingLesson) {
      results.push({ uid, status: "already-had-lesson" });
      continue;
    }

    const recentCats = context.history.slice(-2).map((entry) => entry.category);
    const category = pickCategory(context.weights, recentCats, context.selectedCategories);
    const recentTitles = context.history.slice(-12).map((entry) => entry.title);

    let generated: Lesson | null = null;
    let lastError: unknown;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_USER; attempt++) {
      if (await tokenLimitReached()) {
        stoppedForTokenLimit = true;
        break;
      }
      try {
        const lesson = await generateSourcedLesson(getOpenAI(), {
          category,
          recentTitles,
          model: OPENAI_MODEL,
          researchModel: OPENAI_RESEARCH_MODEL,
          onTokens: async (count) => {
            await reportTokensUsed(count).catch((err) => console.error("Failed to report cron lesson tokens", err));
          },
        });
        generated = { category, ...lesson };
        break;
      } catch (err) {
        lastError = err;
        console.error(`Daily-lesson cron: attempt ${attempt} failed for user ${uid}`, err);
      }
    }

    if (generated) {
      generated = await attachLessonAudio(`lesson-audio/${uid}/${date}.mp3`, generated);
      await saveDailyLessonAdmin(uid, date, generated, context.history);
      results.push({ uid, status: "generated" });
    } else if (!stoppedForTokenLimit) {
      results.push({ uid, status: "failed", error: lastError instanceof Error ? lastError.message : "Unknown error" });
    }
  }

  return NextResponse.json({ date, stoppedForTokenLimit, results });
}
