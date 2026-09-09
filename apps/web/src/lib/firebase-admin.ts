import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { AccessRequest } from "@/lib/auth-guard";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    const serviceAccount = JSON.parse(raw);
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // No explicit key (expected when deployed on Firebase's own infrastructure,
  // e.g. App Hosting/Cloud Run) — fall back to Application Default Credentials.
  return initializeApp();
}

export async function verifyIdToken(idToken: string) {
  const auth = getAuth(getAdminApp());
  return auth.verifyIdToken(idToken);
}

export async function getAccessRequestAdmin(uid: string): Promise<AccessRequest | null> {
  const snap = await getFirestore(getAdminApp()).collection("accessRequests").doc(uid).get();
  return snap.exists ? (snap.data() as AccessRequest) : null;
}
