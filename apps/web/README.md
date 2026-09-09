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
