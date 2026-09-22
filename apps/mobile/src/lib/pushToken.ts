import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { setPushToken } from "./firestore";

/**
 * Requests notification permission and registers this device's Expo push
 * token, so the daily-lesson cron can badge the app icon once a new lesson
 * is ready without the app being open. Badging is a convenience, never
 * required for the app to work, so this never throws — permission denied,
 * no EAS project id, or no token (e.g. the simulator) just logs and returns.
 */
export async function registerPushToken(uid: string): Promise<void> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    const status = existing === "granted" ? existing : (await Notifications.requestPermissionsAsync()).status;
    if (status !== "granted") return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) throw new Error("EAS projectId is not configured in app.json.");

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await setPushToken(uid, token, Platform.OS === "ios" ? "ios" : "android");
  } catch (err) {
    console.error("Failed to register for push notifications:", err);
  }
}
