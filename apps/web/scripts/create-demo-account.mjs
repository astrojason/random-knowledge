#!/usr/bin/env node
// Creates (or resets) the permanent App Review demo account: an email/password
// Firebase Auth user with app access already granted. Run with:
//   npm run create-demo-account -- <email> [password]
//
// Requires the Email/Password provider to be enabled in Firebase Authentication.
// If no password is given, a random one is generated and printed. Re-running for
// an existing email resets its password and re-grants access.
import { randomBytes } from "node:crypto";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const [email, givenPassword] = process.argv.slice(2);
if (!email) {
  console.error("Usage: npm run create-demo-account -- <email> [password]");
  process.exit(1);
}
const password = givenPassword ?? randomBytes(12).toString("base64url");

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) return initializeApp({ credential: cert(JSON.parse(raw)) });
  return initializeApp();
}

const app = getAdminApp();
const auth = getAuth(app);

let user;
try {
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, { password, emailVerified: true });
} catch (err) {
  if (err?.code !== "auth/user-not-found") {
    console.error(`Failed to look up ${email}: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
  try {
    user = await auth.createUser({ email, password, emailVerified: true, displayName: "App Review" });
  } catch (createErr) {
    console.error(`Failed to create ${email}: ${createErr instanceof Error ? createErr.message : createErr}`);
    process.exit(1);
  }
}

const today = new Date().toISOString().slice(0, 10);
await getFirestore(app)
  .collection("accessRequests")
  .doc(user.uid)
  .set(
    {
      uid: user.uid,
      email,
      displayName: user.displayName ?? "App Review",
      status: "granted",
      firstSeenAt: today,
      lastSeenAt: today,
      grantedAt: today,
      grantedBy: "create-demo-account",
    },
    { merge: true }
  );

console.log(`Demo account ready: ${email} (uid: ${user.uid}), access granted.`);
console.log(`Password: ${password}`);
console.log("Put these in App Store Connect -> App Review Information -> Sign-in required.");
