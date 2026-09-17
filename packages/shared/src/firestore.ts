import type { Firestore } from "firebase/firestore";
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, runTransaction, setDoc, updateDoc } from "firebase/firestore";
import { CATEGORY_KEYS, defaultWeights, type CategoryKey, type Weights } from "./categories";
import type { AccessRequest } from "./auth-guard";
import { todayStr } from "./date";
import { fromFirestoreLesson, toFirestoreLesson } from "./lesson-storage";
import type { CronRunLogEntry, DailyProgress, GenerationLogEntry, HistoryEntry, Lesson, StreakData } from "./types";
import { advanceStreak } from "./streak";

const DEFAULT_STREAK: StreakData = { streak: 0, longest: 0, lastDate: null };

/**
 * Binds every Firestore helper to a specific `db` instance so each app
 * (web, mobile) can initialize Firebase its own way while sharing this
 * read/write logic.
 */
export function createFirestoreApi(db: Firestore) {
  async function getStreak(uid: string): Promise<StreakData> {
    const snap = await getDoc(doc(db, "users", uid, "meta", "streak"));
    return snap.exists() ? (snap.data() as StreakData) : DEFAULT_STREAK;
  }

  async function getWeights(uid: string): Promise<Weights> {
    const snap = await getDoc(doc(db, "users", uid, "meta", "weights"));
    // Older accounts retain their preferences and get normal weights for new categories.
    return { ...defaultWeights(), ...(snap.exists() ? (snap.data() as Partial<Weights>) : {}) };
  }

  async function setWeights(uid: string, weights: Weights): Promise<void> {
    await setDoc(doc(db, "users", uid, "meta", "weights"), weights);
  }

  async function getSelectedCategories(uid: string): Promise<CategoryKey[] | null> {
    const snap = await getDoc(doc(db, "users", uid, "meta", "categories"));
    const saved: unknown = snap.exists() ? snap.data().selected : null;
    if (!Array.isArray(saved)) return null;
    const selected = CATEGORY_KEYS.filter((key) => saved.includes(key));
    return selected.length ? selected : null;
  }

  async function setSelectedCategories(uid: string, categories: CategoryKey[]): Promise<void> {
    const selected = CATEGORY_KEYS.filter((key) => categories.includes(key));
    if (!selected.length) throw new Error("Choose at least one category.");
    await setDoc(doc(db, "users", uid, "meta", "categories"), { selected });
  }

  async function getHistory(uid: string): Promise<HistoryEntry[]> {
    const snap = await getDoc(doc(db, "users", uid, "meta", "history"));
    return snap.exists() ? (snap.data().entries as HistoryEntry[]) : [];
  }

  async function appendHistory(
    uid: string,
    entry: HistoryEntry,
    existing: HistoryEntry[]
  ): Promise<HistoryEntry[]> {
    const next = [...existing, entry].slice(-60);
    await setDoc(doc(db, "users", uid, "meta", "history"), { entries: next });
    return next;
  }

  async function getLesson(uid: string, date: string): Promise<Lesson | null> {
    const snap = await getDoc(doc(db, "users", uid, "lessons", date));
    return snap.exists() ? fromFirestoreLesson(snap.data() as Parameters<typeof fromFirestoreLesson>[0]) : null;
  }

  async function setLesson(uid: string, date: string, lesson: Lesson): Promise<void> {
    await setDoc(doc(db, "users", uid, "lessons", date), toFirestoreLesson(lesson));
  }

  async function getProgress(uid: string, date: string): Promise<DailyProgress | null> {
    const snap = await getDoc(doc(db, "users", uid, "progress", date));
    return snap.exists() ? (snap.data() as DailyProgress) : null;
  }

  /** Saves a completed quiz and its streak together, once per lesson date across tabs/retries. */
  async function completeDailyLesson(uid: string, date: string, progress: DailyProgress): Promise<{
    streak: StreakData;
    progress: DailyProgress;
  }> {
    if (!progress.done) throw new Error("Finish the quiz before updating your streak.");
    const streakRef = doc(db, "users", uid, "meta", "streak");
    const progressRef = doc(db, "users", uid, "progress", date);
    return runTransaction(db, async (transaction) => {
      const streakSnap = await transaction.get(streakRef);
      const progressSnap = await transaction.get(progressRef);
      const current = streakSnap.exists() ? streakSnap.data() as StreakData : DEFAULT_STREAK;
      const saved = progressSnap.exists() ? progressSnap.data() as DailyProgress : null;
      if (saved?.done) return { streak: current, progress: saved };
      const next = advanceStreak(current, date);
      transaction.set(streakRef, next);
      transaction.set(progressRef, progress);
      return { streak: next, progress };
    });
  }

  /** Upserts the caller's own accessRequests/{uid} doc; throttled to one write per calendar day. */
  async function recordAccessRequest(user: {
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

  async function getAccessRequest(uid: string): Promise<AccessRequest | null> {
    const snap = await getDoc(doc(db, "accessRequests", uid));
    return snap.exists() ? (snap.data() as AccessRequest) : null;
  }

  /** Superadmin-only (enforced by firestore.rules): lists every access request. */
  async function listAccessRequests(): Promise<AccessRequest[]> {
    const snap = await getDocs(collection(db, "accessRequests"));
    return snap.docs.map((d) => d.data() as AccessRequest);
  }

  /** Superadmin-only (enforced by firestore.rules). */
  async function grantAccess(uid: string, grantedBy: string): Promise<void> {
    await updateDoc(doc(db, "accessRequests", uid), {
      status: "granted",
      grantedAt: todayStr(),
      grantedBy,
    });
  }

  /** Superadmin-only (enforced by firestore.rules). */
  async function revokeAccess(uid: string): Promise<void> {
    await updateDoc(doc(db, "accessRequests", uid), {
      status: "revoked",
      revokedAt: todayStr(),
    });
  }

  /** Superadmin-only (enforced by firestore.rules). Most recent generations first. */
  async function listGenerationLog(max = 50): Promise<GenerationLogEntry[]> {
    const snap = await getDocs(query(collection(db, "generationLog"), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((d) => d.data() as GenerationLogEntry);
  }

  /** Superadmin-only (enforced by firestore.rules). Most recent cron runs first. */
  async function listCronRunLog(max = 50): Promise<CronRunLogEntry[]> {
    const snap = await getDocs(query(collection(db, "cronRunLog"), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((d) => d.data() as CronRunLogEntry);
  }

  /** Deletes every document under users/{uid} — streak, weights, history, lessons, progress. */
  async function resetAllUserData(uid: string): Promise<void> {
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

  return {
    getStreak,
    getWeights,
    setWeights,
    getSelectedCategories,
    setSelectedCategories,
    getHistory,
    appendHistory,
    getLesson,
    setLesson,
    getProgress,
    completeDailyLesson,
    recordAccessRequest,
    getAccessRequest,
    listAccessRequests,
    grantAccess,
    revokeAccess,
    listGenerationLog,
    listCronRunLog,
    resetAllUserData,
  };
}

export type FirestoreApi = ReturnType<typeof createFirestoreApi>;
