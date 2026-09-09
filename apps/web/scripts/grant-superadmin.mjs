#!/usr/bin/env node
// Bootstraps superadmin access by email. Run with:
//   npm run grant-superadmin -- someone@example.com
//
// Sets the `superadmin` Firebase Auth custom claim on that account. The
// granted user must sign out and back in (or wait for their ID token to
// naturally refresh, within ~1 hour) for the change to take effect.
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run grant-superadmin -- <email>");
  process.exit(1);
}

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) return initializeApp({ credential: cert(JSON.parse(raw)) });
  return initializeApp();
}

const auth = getAuth(getAdminApp());

let user;
try {
  user = await auth.getUserByEmail(email);
} catch (err) {
  console.error(`Failed to look up ${email}: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}

await auth.setCustomUserClaims(user.uid, { superadmin: true });
console.log(`Granted superadmin to ${email} (uid: ${user.uid}).`);
console.log("They must sign out and back in for the change to take effect.");
