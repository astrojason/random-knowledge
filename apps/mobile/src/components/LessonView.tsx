import { View } from "react-native";
import type { Lesson } from "@random-knowledge/shared/types";
import { DeepLinks } from "./DeepLinks";
import { LessonBody } from "./LessonBody";
import { ShareLessonButton } from "./ShareLessonButton";
import { Button } from "./ui";

export function LessonView({ lesson, date, onStartQuiz }: { lesson: Lesson; date: string; onStartQuiz: () => void }) {
  return (
    <View>
      <LessonBody lesson={lesson} />
      <DeepLinks lesson={lesson} />
      <ShareLessonButton lesson={lesson} date={date} />
      <Button title="Take the quick check" onPress={onStartQuiz} />
    </View>
  );
}
