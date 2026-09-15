import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { AccessRequest } from "@/lib/auth-guard";
import { CATEGORY_KEYS, defaultWeights, type CategoryKey, type Weights } from "@/lib/categories";
import { fromFirestoreLesson, toFirestoreLesson } from "@/lib/lesson-storage";
import type { HistoryEntry, Lesson } from "@/lib/types";

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

/** Every account currently granted app access, for jobs run without a signed-in user (e.g. the daily-lesson cron). */
export async function listGrantedUserIds(): Promise<string[]> {
  const snap = await getFirestore(getAdminApp()).collection("accessRequests").where("status", "==", "granted").get();
  return snap.docs.map((d) => d.id);
}

export interface DailyGenerationContext {
  existingLesson: Lesson | null;
  weights: Weights;
  history: HistoryEntry[];
  selectedCategories: CategoryKey[];
}

/** Mirrors the reads useDailyLesson performs client-side, via the admin SDK for a specific user with no browser session. */
export async function getDailyGenerationContextAdmin(uid: string, date: string): Promise<DailyGenerationContext> {
  const db = getFirestore(getAdminApp());
  const userRef = db.collection("users").doc(uid);
  const [lessonSnap, weightsSnap, historySnap, categoriesSnap] = await Promise.all([
    userRef.collection("lessons").doc(date).get(),
    userRef.collection("meta").doc("weights").get(),
    userRef.collection("meta").doc("history").get(),
    userRef.collection("meta").doc("categories").get(),
  ]);
  const selectedRaw: unknown = categoriesSnap.exists ? categoriesSnap.data()?.selected : null;
  const selected = Array.isArray(selectedRaw) ? CATEGORY_KEYS.filter((key) => selectedRaw.includes(key)) : [];
  return {
    existingLesson: lessonSnap.exists ? fromFirestoreLesson(lessonSnap.data() as Parameters<typeof fromFirestoreLesson>[0]) : null,
    weights: { ...defaultWeights(), ...(weightsSnap.exists ? (weightsSnap.data() as Partial<Weights>) : {}) },
    history: historySnap.exists ? (historySnap.data()?.entries as HistoryEntry[]) : [],
    selectedCategories: selected.length ? selected : CATEGORY_KEYS,
  };
}

/** Saves a cron-generated lesson and appends it to history, mirroring setLesson + appendHistory from firestore.ts. */
export async function saveDailyLessonAdmin(
  uid: string,
  date: string,
  lesson: Lesson,
  history: HistoryEntry[]
): Promise<void> {
  const db = getFirestore(getAdminApp());
  const userRef = db.collection("users").doc(uid);
  const nextHistory = [...history, { date, category: lesson.category, title: lesson.title }].slice(-60);
  await Promise.all([
    userRef.collection("lessons").doc(date).set(toFirestoreLesson(lesson)),
    userRef.collection("meta").doc("history").set({ entries: nextHistory }),
  ]);
}
