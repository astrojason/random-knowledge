import { StyleSheet, Text, View } from "react-native";
import type { Lesson } from "@random-knowledge/shared/types";
import { useTheme } from "../lib/theme";

export function QuizReview({ lesson, answers }: { lesson: Lesson; answers: number[] }) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.fgStrong }]}>Your answers</Text>
      {lesson.quiz.map((q, qIndex) => {
        const selected = answers[qIndex];
        return (
          <View key={qIndex} style={styles.question}>
            <Text style={{ color: theme.fgMuted, fontSize: 12, marginBottom: 4 }}>Question {qIndex + 1}</Text>
            <Text style={{ color: theme.fgStrong, fontSize: 14.5, fontWeight: "500", marginBottom: 8 }}>{q.question}</Text>
            {q.options.map((option, i) => {
              const isCorrect = i === q.correctIndex;
              const isSelected = i === selected;
              const backgroundColor = isCorrect ? theme.correct : isSelected ? theme.incorrect : theme.surface;
              const borderColor = isCorrect ? theme.accent : isSelected ? theme.rust : theme.border;
              return (
                <View key={i} style={[styles.option, { backgroundColor, borderColor }]}>
                  <Text style={{ color: theme.fg, fontSize: 14.5 }}>{option}</Text>
                </View>
              );
            })}
            <Text style={{ color: theme.fgMuted, fontSize: 13, fontStyle: "italic", lineHeight: 19 }}>{q.explanation}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, paddingTop: 18, marginTop: 20 },
  title: { fontSize: 15, fontWeight: "600", marginBottom: 14 },
  question: { marginBottom: 18 },
  option: { borderRadius: 6, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8 },
});
