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

## Distribution (ad hoc via EAS internal distribution)

This app is not on the App Store. It's built with EAS and installed directly on a handful of registered devices (Jason + friends) — no TestFlight, no Diawi.

**One-time setup**, once logged in (`eas login`) and the project is linked (`eas build:configure` or `eas init` — this is also what generates `extra.eas.projectId` in `app.json`):

- Confirm the EAS project's build visibility is **public**, so a friend can open the install link/QR code in Safari and install without an Expo account. Check with `eas build:view <build-id>` or on the project's dashboard page; if a build page requires login, switch its visibility (or the project default) to public.
- `eas.json` has an `internal` profile (`"distribution": "internal"`) for exactly this — it builds a real-device `.ipa` (`ios.simulator: false`), not a simulator build.

**Registering a new friend's device:**

```
eas device:create
```

This emails/prints a link — have them open it in Safari on the iPhone that should get the app. It installs a UDID-capture provisioning profile; once that's done, their device's UDID is registered to the project's ad hoc provisioning profile.

**Rebuilding after a new device is registered:**

```
eas build --profile internal --platform ios
```

Existing devices don't need a new build when nothing else changed, but a build made *before* a device was registered won't install on it — a new device requires a new build to pick up the updated provisioning profile.

**Sending the build to friends:**

The build finishes with an install link and QR code (also on the build's page in the EAS dashboard) — send that link (or have them scan the QR code). On their iPhone: open the link in Safari, tap install, then do the one-time trust step at **Settings → General → VPN & Device Management** → select the developer profile → Trust.

## Scripts

- `npm run start` — Metro bundler only (pair with an already-installed dev-client build)
- `npm run ios` / `npm run android` — build and run a local dev-client build (`expo run:*`)
- `npm run lint` — ESLint (`expo lint`)
- `npm run typecheck` — `tsc --noEmit`
