import { View } from "react-native";
import type { Lesson } from "@random-knowledge/shared/types";
import { DeepLinks } from "./DeepLinks";
import { LessonBody } from "./LessonBody";
import { Button } from "./ui";

export function LessonView({ lesson, onStartQuiz }: { lesson: Lesson; onStartQuiz: () => void }) {
  return (
    <View>
      <LessonBody lesson={lesson} />
      <DeepLinks lesson={lesson} />
      <Button title="Take the quick check" onPress={onStartQuiz} />
    </View>
  );
}
