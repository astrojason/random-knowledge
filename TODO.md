# TODO

## Follow-up

- [ ] Sharing follow-ups for apps/mobile: open `/share/<id>` links in-app (universal links + associated domains), add a stash and past-lessons library screen (web has `/library`, `/lesson/[date]`, `/stash/[id]`, `/share/[id]`); for now the mobile Share button only shares the web link
- [ ] Create the ElevenLabs voice clone and set `ELEVENLABS_API_KEY`/`ELEVENLABS_VOICE_ID` locally and in production so `ReadAloudButton` uses it instead of falling back to the browser voice
- [ ] Decide on `@types/react` in apps/mobile: pinned to exact `19.2.4` because `19.2.18` broke all React Native JSX typing (`'View' cannot be used as a JSX component`, TS2786) with `react-native@0.86.3` + `typescript@6.0.3`; re-test with newer patches before loosening the pin
- [ ] Add cloned-voice narration (ReadAloudButton) and the superadmin admin screen to apps/mobile — skipped for MVP, web-only for now
- [ ] Add Android support to apps/mobile if desired (app.json already has a package id and adaptive icon placeholders, but Android sign-in/build hasn't been set up or tested)

## Ship apps/mobile as an Unlisted App Store app

Distribution plan: **Unlisted App Distribution** — a normal App Store app (full App Review) that isn't searchable or listed; only people with the direct link can install it, with no device registration or yearly expiry. Not ad hoc, and not TestFlight for other people (builds expire after 90 days). EAS is already linked (`eas.json`, `extra.eas.projectId`), the App ID `com.astrojason.random-knowledge` is registered, and Jason is already enrolled in the Apple Developer Program.

1. **Confirm the Sign in with Apple capability is enabled on the App ID** `com.astrojason.random-knowledge` (Apple Developer portal → Identifiers → Capabilities, "Enable as a primary App ID").
2. **Let EAS manage iOS credentials** (recommended): first `eas build` run offers to auto-create the Distribution Certificate and Provisioning Profile via your Apple Developer account. Only do this manually in the Apple Developer portal if there's a reason to control certs directly.
3. **Load the `EXPO_PUBLIC_*` env vars into EAS.** `apps/mobile/.env.local` is gitignored, so EAS builds don't see it and the app would ship with no Firebase config. From `apps/mobile`, run `eas env:push production --path .env.local`. Make sure `EXPO_PUBLIC_API_BASE_URL` is the deployed site URL, not a localhost address.
4. **Run the production build**: `eas build --platform ios --profile production` (the `production` profile in `eas.json` auto-increments the build number remotely).
5. **Create the app in App Store Connect** (appstoreconnect.apple.com → My Apps → New App): bundle ID `com.astrojason.random-knowledge`, name, primary language, SKU.
6. **Submit the build**: `eas submit --platform ios` (needs an App Store Connect API key, generated in App Store Connect → Users and Access → Integrations — store it as an EAS secret, don't commit it). Optionally verify it via an internal TestFlight build first.
7. **Fill in App Store Connect metadata**: description, keywords, support URL, marketing URL (optional), privacy policy URL (apps/web's `/privacy` page, once deployed publicly), category, and screenshots for the required iPhone display sizes (6.9" and 6.5" at minimum — no iPad screenshots needed since `ios.supportsTablet` is `false`).
8. **Fill in the App Privacy "nutrition label"** (App Store Connect → App Privacy): disclose what's actually collected — email address and user ID (Firebase Auth), usage/lesson data (Firestore), and note none of it is used for tracking/advertising. Get this wrong and Apple rejects or the label misleads users.
9. **Create the permanent App Review demo account.** The app is invite-only (`accessRequests` gating), so a reviewer signing in fresh would hit "Access requested" and reject the app. Enable the Email/Password provider in Firebase Authentication, run `npm run create-demo-account -- <email>` from `apps/web` (prints a generated password), and paste the email/password into App Store Connect → App Review Information → "Sign-in required" with a note to tap "Sign in with email" on the sign-in screen. Keep the account permanent — every future update is re-reviewed.
10. **Submit for review** from App Store Connect once the build, metadata, privacy label, and reviewer access are all in place, then **submit Apple's Unlisted App Distribution request form** (search "unlisted app distribution" on developer.apple.com) for this app. Apple reviews the request; once approved you get the direct link to share. Release the app to "unlisted" only, not to the public store.
11. **After approval**: release (manual or automatic, per the App Store Connect setting chosen at submission). For future updates: pure JS/asset changes can ship instantly via `eas update` (OTA, no App Store review) once `expo-updates` is configured; anything touching native code or `app.json`'s native config needs a new build + submission + review.
