import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getStreakStatus } from "@random-knowledge/shared/streak";
import type { StreakData } from "@random-knowledge/shared/types";
import { useTheme } from "../lib/theme";

const MESSAGES = {
  new: "Finish a lesson and its quiz to start your streak. Every score counts.",
  done: "You showed up today. Come back tomorrow for another discovery.",
  active: "Keep it going with today’s lesson. Every score counts.",
  "at-risk": "Missed yesterday? That’s okay. Finish today’s lesson to keep your streak.",
  broken: "Two days away means a fresh start. Your personal best stays with you.",
};

export function StreakStatus({ streak, date }: { streak: StreakData; date: string }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { count, status } = getStreakStatus(streak, date);

  return (
    <View style={[styles.container, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: theme.accent }]}>
          {count} {count === 1 ? "day" : "days"} in your streak
        </Text>
        <Text style={[styles.best, { color: theme.fgMuted }]}>Personal best: {streak.longest || 0}</Text>
      </View>
      <Text style={{ color: status === "at-risk" ? theme.rust : theme.fg, fontWeight: status === "at-risk" ? "600" : "400", marginTop: 8, fontSize: 14 }}>
        {MESSAGES[status]}
      </Text>
      <Pressable onPress={() => setExpanded((e) => !e)} hitSlop={8}>
        <Text style={{ color: theme.fgMuted, fontSize: 12, fontWeight: "600", marginTop: 10 }}>
          {expanded ? "− Don’t miss twice" : "+ Don’t miss twice"}
        </Text>
      </Pressable>
      {expanded && (
        <Text style={{ color: theme.fgMuted, fontSize: 12, marginTop: 6, lineHeight: 18 }}>
          One missed day is okay. Two missed days in a row reset your streak. Each day you finish a lesson and quiz
          adds one; skipped days don&apos;t add to your count. Days reset at midnight in your device&apos;s timezone.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 8, borderWidth: 1, padding: 16, marginBottom: 20 },
  row: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 8 },
  title: { fontSize: 19, fontWeight: "600" },
  best: { fontSize: 12, fontWeight: "600" },
});
