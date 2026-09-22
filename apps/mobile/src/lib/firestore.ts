import { createFirestoreApi } from "@random-knowledge/shared/firestore";
import { db } from "./firebase";

export const {
  getStreak,
  getWeights,
  setWeights,
  setPushToken,
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
  createShare,
  resetAllUserData,
} = createFirestoreApi(db);
