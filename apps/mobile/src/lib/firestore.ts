import { createFirestoreApi } from "@random-knowledge/shared/firestore";
import { db } from "./firebase";

export const {
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
  resetAllUserData,
} = createFirestoreApi(db);
