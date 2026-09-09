# TODO

## Provisioning (not done by Claude Code — see setup-plan.md)

- [ ] Run `firebase login` and create the Firebase project (setup-plan.md steps 1-4)
- [ ] Enable Google sign-in in Firebase console → Authentication → Sign-in method
- [ ] Create the Firestore database (setup-plan.md step 6)
- [ ] Deploy `firestore.rules` (`firebase deploy --only firestore:rules`)
- [ ] Fill in `apps/web/.env.local` from `apps/web/.env.local.example` (Firebase web config, `OPENAI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY`)
- [ ] Confirm the signed-in Google account's UID is the only one allowed to reach the app past the sign-in screen (single-user gate — see `ALLOWED_UID` in `apps/web/src/lib/auth-guard.ts`)

## Follow-up

- [ ] Run `firebase emulators:start --only firestore,auth` once a project exists, and smoke-test sign-in + a lesson generation against the emulator before pointing at production
- [ ] Decide whether the token-tracker call (`apps/web/src/app/api/generate-lesson/route.ts`) should block on failure or keep failing open as currently implemented
