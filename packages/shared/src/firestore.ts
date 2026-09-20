import type { Firestore } from "firebase/firestore";
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, runTransaction, setDoc, updateDoc } from "firebase/firestore";
import { CATEGORY_KEYS, defaultWeights, type CategoryKey, type Weights } from "./categories";
import type { AccessRequest } from "./auth-guard";
import { todayStr } from "./date";
import { fromFirestoreLesson, toFirestoreLesson } from "./lesson-storage";
import type { CronRunLogEntry, DailyProgress, GenerationLogEntry, HistoryEntry, Lesson, SharedLesson, StashEntry, StreakData } from "./types";
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

  /** Snapshots a lesson to shares/{id} (once per lesson date) and returns the id used in its share link. */
  async function createShare(
    owner: { uid: string; displayName: string | null },
    date: string,
    lesson: Lesson
  ): Promise<string> {
    const pointerRef = doc(db, "users", owner.uid, "shares", date);
    const pointer = await getDoc(pointerRef);
    if (pointer.exists()) return pointer.data().shareId as string;

    const shareRef = doc(collection(db, "shares"));
    await setDoc(doc(db, "shares", shareRef.id), {
      ownerUid: owner.uid,
      ownerName: owner.displayName,
      date,
      title: lesson.title,
      category: lesson.category,
      createdAt: new Date().toISOString(),
      lesson: toFirestoreLesson(lesson),
    });
    await setDoc(pointerRef, { shareId: shareRef.id });
    return shareRef.id;
  }

  /** Readable only by accounts with app access (enforced by firestore.rules). */
  async function getShare(id: string): Promise<SharedLesson | null> {
    const snap = await getDoc(doc(db, "shares", id));
    if (!snap.exists()) return null;
    const data = snap.data() as Omit<SharedLesson, "id" | "lesson"> & { lesson: Parameters<typeof fromFirestoreLesson>[0] };
    return {
      id,
      ownerName: data.ownerName,
      title: data.title,
      category: data.category,
      createdAt: data.createdAt,
      lesson: fromFirestoreLesson(data.lesson),
    };
  }

  /** Saves a copy of a shared lesson so it stays readable even if the share is later removed. */
  async function addToStash(uid: string, share: SharedLesson): Promise<void> {
    await setDoc(doc(db, "users", uid, "stash", share.id), {
      savedAt: new Date().toISOString(),
      sharedBy: share.ownerName,
      title: share.title,
      category: share.category,
      lesson: toFirestoreLesson(share.lesson),
    });
  }

  function toStashEntry(id: string, data: Record<string, unknown>): StashEntry {
    return {
      id,
      savedAt: data.savedAt as string,
      sharedBy: (data.sharedBy as string | null) ?? null,
      title: data.title as string,
      category: data.category as StashEntry["category"],
      lesson: fromFirestoreLesson(data.lesson as Parameters<typeof fromFirestoreLesson>[0]),
    };
  }

  async function getStashEntry(uid: string, id: string): Promise<StashEntry | null> {
    const snap = await getDoc(doc(db, "users", uid, "stash", id));
    return snap.exists() ? toStashEntry(id, snap.data()) : null;
  }

  /** Newest saved first. */
  async function getStash(uid: string): Promise<StashEntry[]> {
    const snap = await getDocs(collection(db, "users", uid, "stash"));
    return snap.docs.map((d) => toStashEntry(d.id, d.data())).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  }

  async function removeFromStash(uid: string, id: string): Promise<void> {
    await deleteDoc(doc(db, "users", uid, "stash", id));
  }

  /** Deletes every document under users/{uid} — streak, weights, history, lessons, progress, stash, share pointers (the shares/ snapshots friends already opened stay). */
  async function resetAllUserData(uid: string): Promise<void> {
    const metaDocs = ["streak", "weights", "history", "categories"].map((id) => doc(db, "users", uid, "meta", id));
    const [lessonDocs, progressDocs, stashDocs, shareDocs] = await Promise.all(
      ["lessons", "progress", "stash", "shares"].map((name) => getDocs(collection(db, "users", uid, name)))
    );
    await Promise.all([
      ...metaDocs.map((d) => deleteDoc(d)),
      ...[lessonDocs, progressDocs, stashDocs, shareDocs].flatMap((snap) => snap.docs.map((d) => deleteDoc(d.ref))),
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
    createShare,
    getShare,
    addToStash,
    getStashEntry,
    getStash,
    removeFromStash,
    resetAllUserData,
  };
}

export type FirestoreApi = ReturnType<typeof createFirestoreApi>;
