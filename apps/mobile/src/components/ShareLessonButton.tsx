import { useState } from "react";
import { Share, Text, View } from "react-native";
import type { Lesson } from "@random-knowledge/shared/types";
import { shareMessage, shareUrl } from "@random-knowledge/shared/share";
import { useAuth } from "../lib/auth-context";
import { createShare } from "../lib/firestore";
import { useTheme } from "../lib/theme";
import { LinkText } from "./ui";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/** Shares a link to the web app's /share page; a friend without an account gets the invite there. */
export function ShareLessonButton({ lesson, date }: { lesson: Lesson; date: string }) {
  const theme = useTheme();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function share() {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (!API_BASE_URL) throw new Error("EXPO_PUBLIC_API_BASE_URL isn't set, so there's no link to share.");
      const id = await createShare(user, date, lesson);
      const url = shareUrl(API_BASE_URL, id);
      await Share.share({ message: `${shareMessage(lesson.title, user.displayName)} ${url}`, url });
    } catch (err) {
      console.error("Share failed:", err);
      setError(err instanceof Error ? err.message : "Couldn't share this lesson.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <LinkText title="Share with a friend" onPress={share} />
      {error && <Text style={{ color: theme.rust, fontSize: 13, marginTop: 6 }}>{error}</Text>}
    </View>
  );
}
