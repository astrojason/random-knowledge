import { Pressable, StyleSheet, Text, View } from "react-native";
import { DONT_REMEMBER, type QuizState } from "@random-knowledge/shared/quiz";
import type { Lesson } from "@random-knowledge/shared/types";
import { useTheme } from "../lib/theme";
import { Button } from "./ui";

export function QuizView({
  lesson,
  quiz,
  onSelect,
  onNext,
}: {
  lesson: Lesson;
  quiz: QuizState;
  onSelect: (index: number) => void;
  onNext: () => void;
}) {
  const theme = useTheme();
  const q = lesson.quiz[quiz.qIndex];
  const answered = quiz.selected !== null;

  return (
    <View>
      <Text style={{ color: theme.fgMuted, fontSize: 12, marginBottom: 6 }}>
        Question {quiz.qIndex + 1} of {lesson.quiz.length}
      </Text>
      <Text style={[styles.question, { color: theme.fgStrong }]}>{q.question}</Text>
      <View style={{ marginBottom: 4 }}>
        {q.options.map((option, i) => {
          const isCorrect = i === q.correctIndex;
          const isSelected = i === quiz.selected;
          const state = !answered ? "idle" : isCorrect ? "correct" : isSelected ? "incorrect" : "idle";
          const backgroundColor = state === "correct" ? theme.correct : state === "incorrect" ? theme.incorrect : theme.surface;
          const borderColor = state === "correct" ? theme.accent : state === "incorrect" ? theme.rust : theme.border;
          return (
            <Pressable
              key={i}
              disabled={answered}
              onPress={() => onSelect(i)}
              style={[styles.option, { backgroundColor, borderColor }]}
            >
              <Text style={{ color: theme.fg, fontSize: 14.5 }}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
      {!answered && (
        <Pressable onPress={() => onSelect(DONT_REMEMBER)} style={{ marginBottom: 4 }}>
          <Text style={{ color: theme.fgMuted, fontSize: 13, textDecorationLine: "underline" }}>
            I don&apos;t remember
          </Text>
        </Pressable>
      )}
      {answered && quiz.selected === DONT_REMEMBER && (
        <Text style={{ color: theme.fgMuted, fontSize: 13, marginBottom: 4 }}>
          You said you didn&apos;t remember — that&apos;s honest, and now you know.
        </Text>
      )}
      {answered && (
        <>
          <Text style={{ color: theme.fgMuted, fontSize: 13, fontStyle: "italic", lineHeight: 19, marginTop: 8 }}>
            {q.explanation}
          </Text>
          <View style={{ marginTop: 18 }}>
            <Button title="Continue" onPress={onNext} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  question: { fontSize: 17, fontWeight: "600", marginBottom: 14 },
  option: { borderRadius: 6, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8 },
});
