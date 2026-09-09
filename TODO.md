# TODO

## Provisioning (not done by Claude Code — see setup-plan.md)

- [ ] Redeploy `firestore.rules` (`firebase deploy --only firestore:rules`) — now includes the `accessRequests` grant-system rules
- [ ] Run `npm run grant-superadmin -- jason@astrojason.com` once deployed, then sign out/in to pick up the superadmin claim

## Follow-up

- [ ] Run `firebase emulators:start --only firestore,auth` once a project exists, and smoke-test sign-in + a lesson generation against the emulator before pointing at production
- [ ] Decide whether the token-tracker call (`apps/web/src/app/api/generate-lesson/route.ts`) should block on failure or keep failing open as currently implemented
