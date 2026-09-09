# Firebase Setup Plan — Daily Lesson App

## App Overview

This is a daily micro-learning app, replacing a paid subscription (SmartyMe). Core mechanics:

- **One AI-generated lesson per day.** On load, the app checks if today's lesson already exists for this user. If not, it picks a topic category (weighted random, biased toward categories the user favors) and calls an LLM (OpenAI) server-side to generate a short lesson: a title, 3 short paragraphs (~250-300 words total), and 3 multiple-choice quiz questions testing comprehension of that specific lesson.
- **Categories:** Mind & Behavior (psychology), Engineering, How Things Work, Art History, Big Ideas Simply Explained (advanced physics/math/CS explained ELI5 without dumbing down the actual concept), and Everything Else (general interest).
- **Deeper-dive links.** Each lesson includes a Wikipedia search link and a YouTube search link (constructed from a short search phrase the model provides — never a fabricated direct URL, since those can point to pages/videos that don't exist).
- **Quiz + streak.** After reading, the user takes the 3-question check. Completing it for the day increments a streak counter. Streak logic is "don't miss twice": missing a single day doesn't break the streak, but missing two days in a row resets it to 1. After the quiz, the user can nudge weights up or down ("more like this" / "less like this") to shift future category odds.
- **History tracking.** Past lesson titles are kept so the generation prompt can avoid repeating topics.
- **Persistence requirement (the actual reason this is becoming a real app):** the original version used an artifact's built-in per-conversation storage, which turned out not to reliably sync across devices/sessions — same lesson showing differently on phone vs. computer, and eventually storage reads failing outright. This rebuild's entire point is real, reliable, cross-device persistence via Firestore under the signed-in user's account.
- **Single user for now** (Jason), gated behind Firebase Auth, with room to expand to more users later without redesigning the data model (see the `users/{uid}/...` structure in step 8 below).

The steps below set up the Firebase side (Auth + Firestore) that this app's data model depends on. The Next.js app itself (UI, the `/api/generate-lesson` route calling OpenAI, and the Firestore read/write logic replacing the old `window.storage` calls) is a separate build step that consumes the config and rules produced here.

Goal: stand up a Firebase project with Authentication + Firestore, register a web app, and produce the config values needed for the Next.js app's `.env.local`.

Most of this is CLI-doable. A couple of steps require the Firebase console in a browser — flagged explicitly below. Do not skip those by improvising a CLI equivalent that doesn't exist.

## 0. Prerequisites

- Node.js installed (for `npm install -g firebase-tools`)
- A Google account to own the project
- Confirm CLI version before relying on exact flag names:
  ```
  npm install -g firebase-tools
  firebase --version
  firebase --help
  ```
  Command syntax below is based on tooling as of early 2026 — if any command errors, run `firebase <command> --help` and adjust rather than guessing.

## 1. Authenticate the CLI

```
firebase login
```

This opens a browser for Google sign-in. If running headless, use:
```
firebase login --no-localhost
```

## 2. Create the Firebase project

```
firebase projects:create daily-lesson-app --display-name "Daily Lesson App"
```

- Project ID must be globally unique — if `daily-lesson-app` is taken, append a suffix (e.g. `daily-lesson-app-jason`).
- Note the returned project ID; it's needed in every step after this.

Verify:
```
firebase projects:list
```

## 3. Set the active project for this directory

Run this from the Next.js app's root folder (create the folder first if it doesn't exist yet):
```
firebase use --add
```
Select the project just created, give it an alias like `default`.

## 4. Register a Web App in the project

```
firebase apps:create WEB "Daily Lesson Web"
```

This returns an App ID. Get the full config object from it:
```
firebase apps:sdkconfig WEB <APP_ID>
```

This prints the `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId` — copy all of these into the app's `.env.local` (as `NEXT_PUBLIC_FIREBASE_*` vars, since these are safe to expose client-side by design).

## 5. Enable Authentication — console step, no CLI equivalent

Firebase CLI cannot toggle sign-in providers. This has to be done manually:

1. Go to https://console.firebase.google.com → select the project.
2. Authentication → Get Started.
3. Enable **Google** sign-in.
4. Access is controlled by a grant system, not a hardcoded UID: anyone who signs in without access is recorded as a pending `accessRequests/{uid}` doc, and the superadmin (Jason) grants or revokes access from the app's `/admin` page. Superadmin status itself is a Firebase Auth custom claim, bootstrapped by running `npm run grant-superadmin -- <email>` locally (see `apps/web/scripts/grant-superadmin.mjs`) — do this once after Authentication is enabled.

## 6. Create the Firestore database

```
firebase firestore:databases:create "(default)" --location=nam5
```

- `--location` is permanent once set — pick a region once and don't try to change it later. `nam5` (US) is a reasonable default; adjust if there's a latency reason not to.
- If this command doesn't exist on the installed CLI version, create it manually instead: console → Firestore Database → Create Database → **Production mode**.

## 7. Write Firestore security rules

Create `firestore.rules` in the project root:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /accessRequests/{uid} {
      allow read, write: if request.auth != null && request.auth.token.superadmin == true;
      allow get: if request.auth != null && request.auth.uid == uid;
      allow create: if request.auth != null && request.auth.uid == uid
        && request.resource.data.uid == uid
        && request.resource.data.status == "pending";
      allow update: if request.auth != null && request.auth.uid == uid
        && request.resource.data.status == resource.data.status
        && request.resource.data.uid == uid;
    }
  }
}
```

This locks every user's data to that user's own UID — no user can read or write another user's documents, and nothing is accessible unsigned. `accessRequests` additionally lets the superadmin (identified by the `superadmin` custom claim, not a hardcoded UID) manage everyone's access, while a regular user can only see and create their own pending request.

Deploy the rules:
```
firebase deploy --only firestore:rules
```

## 8. Data model (for reference when writing the app code)

```
users/{uid}/meta/streak       -> { streak, longest, lastDate }
users/{uid}/meta/weights      -> { psychology, engineering, howthings, arthistory, advanced, general }
users/{uid}/meta/history      -> { entries: [{date, category, title}, ...] }
users/{uid}/lessons/{date}    -> { category, title, body, wikiQuery, youtubeQuery, quiz }
users/{uid}/progress/{date}   -> { qIndex, correct, done }
accessRequests/{uid}          -> { uid, email, displayName, status, firstSeenAt, lastSeenAt, grantedAt?, grantedBy?, revokedAt? }
```

This maps directly onto the key-value scheme the artifact version already used — same keys, just under the user's UID instead of the artifact's flat storage.

## 9. Verify end-to-end before writing app code against it

```
firebase emulators:start --only firestore,auth
```

Confirms the project config is valid without touching production data. If the emulators start cleanly, the config values pulled in step 4 are good to drop into `.env.local`.

## 9b. Token usage tracking (for the /api/generate-lesson route)

Not part of Firebase — this belongs in the Next.js API route that calls OpenAI (see app overview above), but noting it here so Claude Code has it when that route gets built.

An external tracker service exists at `https://token-tracker-roan.vercel.app/api/tokens` — GET returns `{ tokens }` for the current UTC day, POST with `{ tokens: count }` adds to that day's total (limit 250,000/day, resets 00:00 UTC). Before treating this as trusted infrastructure: confirm with Jason whether this is a tracker he already owns/runs, since the plan currently has no record of that — it showed up via an uploaded integration doc rather than being decided on earlier in this build.

Adapted for this app's actual stack (Node/Next.js, OpenAI instead of Anthropic):

```js
const TRACKER = "https://token-tracker-roan.vercel.app/api/tokens";
const DAILY_LIMIT = 250000;

async function getTokensUsed() {
  const res = await fetch(TRACKER);
  const { tokens } = await res.json();
  return tokens;
}

async function reportTokens(count) {
  await fetch(TRACKER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens: count }),
  });
}

// inside the /api/generate-lesson handler, before calling OpenAI:
const used = await getTokensUsed().catch(() => 0); // fail open if tracker unreachable
if (used >= DAILY_LIMIT) {
  return new Response(
    JSON.stringify({ error: `Daily token limit reached (${used.toLocaleString()} / ${DAILY_LIMIT.toLocaleString()})` }),
    { status: 429 }
  );
}

const completion = await openai.chat.completions.create({ /* your params */ });

const tokensUsed = completion.usage.total_tokens;
await reportTokens(tokensUsed).catch(() => {}); // don't let tracker failures break lesson generation
```

Notes:
- This is advisory only — no hard server-side enforcement, and the check/report calls fail open (a tracker outage never blocks the actual lesson generation).
- At one generation a day (~800-1,200 tokens), this app alone will never come close to 250k/day — this limit only matters if the tracker is shared across multiple apps/projects.

## 10. Output checklist

By the end of this plan, confirm these exist and are recorded somewhere safe (not committed to git):

- [ ] Firebase project ID
- [ ] Web app config (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
- [ ] Email/Password (or Google) auth enabled in console
- [ ] Firestore database created, region set
- [ ] `firestore.rules` deployed
- [ ] Emulator smoke test passed
