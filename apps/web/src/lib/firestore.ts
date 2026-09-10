import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CATEGORY_KEYS, defaultWeights, type CategoryKey, type Weights } from "@/lib/categories";
import type { AccessRequest } from "@/lib/auth-guard";
import { todayStr } from "@/lib/date";
import type { DailyProgress, HistoryEntry, Lesson, StreakData } from "@/lib/types";

const DEFAULT_STREAK: StreakData = { streak: 0, longest: 0, lastDate: null };

export async function getStreak(uid: string): Promise<StreakData> {
  const snap = await getDoc(doc(db, "users", uid, "meta", "streak"));
  return snap.exists() ? (snap.data() as StreakData) : DEFAULT_STREAK;
}

export async function setStreak(uid: string, data: StreakData): Promise<void> {
  await setDoc(doc(db, "users", uid, "meta", "streak"), data);
}

export async function getWeights(uid: string): Promise<Weights> {
  const snap = await getDoc(doc(db, "users", uid, "meta", "weights"));
  // Older accounts retain their preferences and get normal weights for new categories.
  return { ...defaultWeights(), ...(snap.exists() ? (snap.data() as Partial<Weights>) : {}) };
}

export async function setWeights(uid: string, weights: Weights): Promise<void> {
  await setDoc(doc(db, "users", uid, "meta", "weights"), weights);
}

export async function getSelectedCategories(uid: string): Promise<CategoryKey[] | null> {
  const snap = await getDoc(doc(db, "users", uid, "meta", "categories"));
  const saved: unknown = snap.exists() ? snap.data().selected : null;
  if (!Array.isArray(saved)) return null;
  const selected = CATEGORY_KEYS.filter((key) => saved.includes(key));
  return selected.length ? selected : null;
}

export async function setSelectedCategories(uid: string, categories: CategoryKey[]): Promise<void> {
  const selected = CATEGORY_KEYS.filter((key) => categories.includes(key));
  if (!selected.length) throw new Error("Choose at least one category.");
  await setDoc(doc(db, "users", uid, "meta", "categories"), { selected });
}

export async function getHistory(uid: string): Promise<HistoryEntry[]> {
  const snap = await getDoc(doc(db, "users", uid, "meta", "history"));
  return snap.exists() ? (snap.data().entries as HistoryEntry[]) : [];
}

export async function appendHistory(
  uid: string,
  entry: HistoryEntry,
  existing: HistoryEntry[]
): Promise<HistoryEntry[]> {
  const next = [...existing, entry].slice(-60);
  await setDoc(doc(db, "users", uid, "meta", "history"), { entries: next });
  return next;
}

export async function getLesson(uid: string, date: string): Promise<Lesson | null> {
  const snap = await getDoc(doc(db, "users", uid, "lessons", date));
  return snap.exists() ? (snap.data() as Lesson) : null;
}

export async function setLesson(uid: string, date: string, lesson: Lesson): Promise<void> {
  await setDoc(doc(db, "users", uid, "lessons", date), lesson);
}

export async function getProgress(uid: string, date: string): Promise<DailyProgress | null> {
  const snap = await getDoc(doc(db, "users", uid, "progress", date));
  return snap.exists() ? (snap.data() as DailyProgress) : null;
}

export async function setProgress(
  uid: string,
  date: string,
  progress: DailyProgress
): Promise<void> {
  await setDoc(doc(db, "users", uid, "progress", date), progress);
}

/** Upserts the caller's own accessRequests/{uid} doc; throttled to one write per calendar day. */
export async function recordAccessRequest(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
}): Promise<void> {
  const ref = doc(db, "accessRequests", user.uid);
  const snap = await getDoc(ref);
  const today = todayStr();
  if (!snap.exists()) {
    const request: AccessRequest = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      status: "pending",
      firstSeenAt: today,
      lastSeenAt: today,
    };
    await setDoc(ref, request);
    return;
  }
  const existing = snap.data() as AccessRequest;
  if (existing.lastSeenAt === today) return;
  await updateDoc(ref, { lastSeenAt: today, email: user.email, displayName: user.displayName });
}

export async function getAccessRequest(uid: string): Promise<AccessRequest | null> {
  const snap = await getDoc(doc(db, "accessRequests", uid));
  return snap.exists() ? (snap.data() as AccessRequest) : null;
}

/** Superadmin-only (enforced by firestore.rules): lists every access request. */
export async function listAccessRequests(): Promise<AccessRequest[]> {
  const snap = await getDocs(collection(db, "accessRequests"));
  return snap.docs.map((d) => d.data() as AccessRequest);
}

/** Superadmin-only (enforced by firestore.rules). */
export async function grantAccess(uid: string, grantedBy: string): Promise<void> {
  await updateDoc(doc(db, "accessRequests", uid), {
    status: "granted",
    grantedAt: todayStr(),
    grantedBy,
  });
}

/** Superadmin-only (enforced by firestore.rules). */
export async function revokeAccess(uid: string): Promise<void> {
  await updateDoc(doc(db, "accessRequests", uid), {
    status: "revoked",
    revokedAt: todayStr(),
  });
}

/** Deletes every document under users/{uid} — streak, weights, history, lessons, progress. */
export async function resetAllUserData(uid: string): Promise<void> {
  const metaDocs = ["streak", "weights", "history", "categories"].map((id) => doc(db, "users", uid, "meta", id));
  const [lessonDocs, progressDocs] = await Promise.all([
    getDocs(collection(db, "users", uid, "lessons")),
    getDocs(collection(db, "users", uid, "progress")),
  ]);
  await Promise.all([
    ...metaDocs.map((d) => deleteDoc(d)),
    ...lessonDocs.docs.map((d) => deleteDoc(d.ref)),
    ...progressDocs.docs.map((d) => deleteDoc(d.ref)),
  ]);
}
