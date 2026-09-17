import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatDateLabel } from "@random-knowledge/shared/date";
import { CATEGORIES } from "@random-knowledge/shared/categories";
import { useAuth } from "../lib/auth-context";
import { useTheme } from "../lib/theme";
import { useDailyLesson } from "../hooks/useDailyLesson";
import { CategoryPicker } from "../components/CategoryPicker";
import { DoneView } from "../components/DoneView";
import { ErrorView } from "../components/ErrorView";
import { LessonView } from "../components/LessonView";
import { LoadingView } from "../components/LoadingView";
import { QuizView } from "../components/QuizView";
import { StreakStatus } from "../components/StreakStatus";
import { Card, LinkText } from "../components/ui";

export function DailyLessonScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const state = useDailyLesson(user);
  const { phase, date, lesson, streak, selectedCategories, actions } = state;
  const [editingCategories, setEditingCategories] = useState(false);
  const [categoriesSaved, setCategoriesSaved] = useState(false);
  const canEditCategories = ["lesson", "quiz", "done"].includes(phase);
  const showCategoryPicker = phase === "categories" || (canEditCategories && editingCategories);

  function confirmReset() {
    Alert.alert(
      "Reset your data?",
      "This clears your streak, history, and topic preferences. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setEditingCategories(false);
            setCategoriesSaved(false);
            void actions.resetAll();
          },
        },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Card>
        <View style={[styles.header, { borderColor: theme.border }]}>
          <View style={styles.headerRow}>
            <Text style={{ color: theme.fgMuted, fontSize: 13 }}>{formatDateLabel(date)}</Text>
            <Text onPress={signOut} style={{ color: theme.fgMuted, fontSize: 12, fontWeight: "500", textDecorationLine: "underline" }}>
              Sign out
            </Text>
          </View>
          {phase !== "loading" && <StreakStatus streak={streak} date={date} />}
          {lesson?.category && (
            <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
              <Text style={{ color: theme.accent, fontSize: 12, fontWeight: "600" }}>{CATEGORIES[lesson.category]}</Text>
            </View>
          )}
        </View>

        {canEditCategories && !editingCategories && (
          <View style={styles.categoryToggle}>
            <LinkText
              title={`My categories (${selectedCategories.length})`}
              onPress={() => {
                setEditingCategories(true);
                setCategoriesSaved(false);
              }}
            />
            {categoriesSaved && <Text style={{ color: theme.fgMuted, fontSize: 11 }}>Categories saved for future lessons.</Text>}
          </View>
        )}

        {showCategoryPicker && (
          <CategoryPicker
            selectedCategories={selectedCategories}
            onSave={async (categories) => {
              await actions.saveCategories(categories);
              setEditingCategories(false);
              setCategoriesSaved(true);
            }}
            onCancel={phase === "categories" ? undefined : () => setEditingCategories(false)}
          />
        )}

        <LessonPhase state={state} />

        <View style={[styles.footer, { borderColor: theme.border }]}>
          <Text onPress={confirmReset} style={{ color: theme.fgMuted, fontSize: 11, textDecorationLine: "underline" }}>
            Reset my data
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

function LessonPhase({ state }: { state: ReturnType<typeof useDailyLesson> }) {
  const { phase, lesson, progress, quiz, errorMessage, actions } = state;
  if (phase === "loading") return <LoadingView text="Setting things up" />;
  if (phase === "generating") return <LoadingView text="Researching and checking today’s lesson" />;
  if (phase === "error") return <ErrorView message={errorMessage ?? "Unknown error"} onRetry={actions.retry} />;
  if (!lesson) return null;
  if (phase === "lesson") return <LessonView lesson={lesson} onStartQuiz={actions.startQuiz} />;
  if (phase === "quiz") return <QuizView lesson={lesson} quiz={quiz} onSelect={actions.selectOption} onNext={actions.nextQuestion} />;
  if (phase !== "done" || !progress) return null;
  return (
    <DoneView
      lesson={lesson}
      progress={progress}
      onMore={() => actions.adjustWeight(lesson.category, 4)}
      onLess={() => actions.adjustWeight(lesson.category, -4)}
    />
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 48 },
  header: { borderBottomWidth: 1, paddingBottom: 14, marginBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 },
  badge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginTop: 14 },
  categoryToggle: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 20 },
  footer: { borderTopWidth: 1, paddingTop: 12, marginTop: 24 },
});
