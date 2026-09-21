# Random Knowledge (mobile)

The Expo/React Native client for the same single-user daily micro-learning app as `../web`. Shares Firebase Auth, Firestore, and the lesson-generation API with the web app; see `../../TODO.md` for what's left.

## Stack

- Expo (managed workflow, `expo-dev-client` for local dev builds) + React Native
- Firebase Auth (native Google Sign-In) + Firestore, via the client SDK
- Talks to apps/web's `/api/generate-lesson` for lesson generation

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in the values (same Firebase project as apps/web).
2. `npm install`
3. `./../../scripts/ios-dev` (or `npm run ios` from this directory) to build and run the iOS dev client — this can't run in plain Expo Go because of the native Google Sign-In module.

## Distribution

The target is an **Unlisted App Store app**: submitted through normal App Review but not searchable — only people with the direct link can install it (steps in the repo root `TODO.md`).

For your own testing, plug your iPhone in and run `npm run ios` (dev client). To try a release-like build, upload a production build (`eas build --platform ios --profile production`, then `eas submit`) and install it from TestFlight — internal testing skips Apple review.

## Scripts

- `npm run start` — Metro bundler only (pair with an already-installed dev-client build)
- `npm run ios` / `npm run android` — build and run a local dev-client build (`expo run:*`)
- `npm run lint` — ESLint (`expo lint`)
- `npm run typecheck` — `tsc --noEmit`
