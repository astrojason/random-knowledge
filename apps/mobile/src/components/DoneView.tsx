import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CATEGORIES } from "@random-knowledge/shared/categories";
import type { DailyProgress, Lesson } from "@random-knowledge/shared/types";
import { useTheme } from "../lib/theme";
import { DeepLinks } from "./DeepLinks";
import { LessonBody } from "./LessonBody";
import { QuizReview } from "./QuizReview";
import { ShareLessonButton } from "./ShareLessonButton";
import { Button } from "./ui";

export function DoneView({
  lesson,
  date,
  progress,
  onMore,
  onLess,
}: {
  lesson: Lesson;
  date: string;
  progress: DailyProgress;
  onMore: () => void;
  onLess: () => void;
}) {
  const theme = useTheme();
  const [flashed, setFlashed] = useState<"more" | "less" | null>(null);

  function handle(kind: "more" | "less", action: () => void) {
    action();
    setFlashed(kind);
  }

  return (
    <View>
      <LessonBody lesson={lesson} />
      <View style={styles.summary}>
        <Text style={[styles.score, { color: theme.fgStrong }]}>
          {progress.correct} of {progress.total} today
        </Text>
        <Text style={{ color: theme.fgMuted, fontSize: 13, marginBottom: 16, textAlign: "center" }}>
          Today&apos;s topic: {CATEGORIES[lesson.category]}. Come back tomorrow for the next one.
        </Text>
        <DeepLinks lesson={lesson} />
        <ShareLessonButton lesson={lesson} date={date} />
        <Text style={{ color: theme.fgMuted, fontSize: 13, marginBottom: 10 }}>Want more like this, or less?</Text>
        <View style={styles.row}>
          <Button
            title={flashed === "less" ? "Got it" : `Less ${CATEGORIES[lesson.category]}`}
            variant="secondary"
            disabled={flashed === "less"}
            onPress={() => handle("less", onLess)}
          />
          <Button
            title={flashed === "more" ? "Got it" : `More ${CATEGORIES[lesson.category]}`}
            disabled={flashed === "more"}
            onPress={() => handle("more", onMore)}
          />
        </View>
      </View>
      {progress.answers && <QuizReview lesson={lesson} answers={progress.answers} />}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { alignItems: "center", paddingVertical: 20 },
  score: { fontSize: 20, fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", gap: 10 },
});
