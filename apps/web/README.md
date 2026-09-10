# Random Knowledge

A single-user daily micro-learning app: one AI-generated lesson a day, a 3-question comprehension check, and a streak. See `../../setup-plan.md` for the Firebase provisioning plan and `../../TODO.md` for what's left to do before this runs end-to-end.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind v4)
- Firebase Auth (Google sign-in) + Firestore, client SDK for reads/writes, Admin SDK server-side to verify ID tokens
- OpenAI (server-side, in `src/app/api/generate-lesson/route.ts`) for lesson generation

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in the values (see comments in that file, and `../../setup-plan.md`).
2. `npm install`
3. `npm run dev`

The app will not run without a real Firebase project — sign-in and every Firestore read/write depend on it. Provisioning that project (steps 1-8 of `../../setup-plan.md`) is a manual/CLI step outside of this codebase.

## Lesson evidence and accuracy

New lessons first use the Responses API's `web_search` tool to gather cited research (`OPENAI_RESEARCH_MODEL`, default `gpt-4.1`). The existing `OPENAI_MODEL` writes the lesson from those notes, then a separate call reviews the draft, its paragraph references, and quiz against the notes. Source URLs come from the research response's citation metadata, not URLs invented by the writer. Generation rejects missing citations, invalid lesson/quiz structure, and failed factual reviews without falling back to unsourced generation. Research must cite at least two different hosts; the prompts additionally require authoritative, independent corroboration. Host diversity alone does not establish independence or quality.

About 35% of generation attempts request a surprising, counterintuitive topic within the user's selected category. Evidence takes priority over the surprise angle. Myths and religious beliefs must be presented as documented traditions, not empirical events; hypothetical examples must be labeled.

Paragraph references and a source list appear with new lessons. Previously saved lessons remain available and are labeled as predating source checks. Automated research and review reduce fabrication risk but cannot guarantee that every claim is true; the review checks model-generated research notes, not raw source documents. Human editorial review is still needed for an absolute publication standard.

This flow adds web-search charges and two model calls per new lesson, so it takes longer and costs more than the previous single-call flow. All returned token usage is reported, including rejected drafts; the shared token tracker does not track search-tool charges. A live smoke test requires a configured OpenAI key with access to both models and web search. See the [official web-search documentation](https://developers.openai.com/api/docs/guides/tools-web-search).

## Structure

- `src/lib/firebase.ts` / `firebase-admin.ts` — client and server Firebase init
- `src/lib/auth-context.tsx` — Google sign-in state (`useAuth()`)
- `src/lib/auth-guard.ts` — single-user allowlist (`NEXT_PUBLIC_ALLOWED_UID`)
- `src/lib/firestore.ts` — reads/writes for `users/{uid}/...` (see `../../setup-plan.md` step 8 for the data model)
- `src/lib/useDailyLesson.ts` — the app's state machine: load today's lesson, generate one if missing, run the quiz, save streak/progress
- `src/components/lesson/` — the lesson/quiz/done views
- `src/app/api/generate-lesson/route.ts` — server route that verifies the caller's Firebase ID token, checks the shared token-tracker budget, calls OpenAI, and returns the generated lesson JSON

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build (must pass before any change is considered done — see `../../CLAUDE.md`)
- `npm run lint` — ESLint (must also pass)
