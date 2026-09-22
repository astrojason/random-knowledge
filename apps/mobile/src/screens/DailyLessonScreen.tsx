import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { formatDateLabel } from "@random-knowledge/shared/date";
import { CATEGORIES } from "@random-knowledge/shared/categories";
import { getStreakStatus } from "@random-knowledge/shared/streak";
import { useAuth } from "../lib/auth-context";
import { useTheme } from "../lib/theme";
import { useDailyLesson } from "../hooks/useDailyLesson";
import { CategoryPicker } from "../components/CategoryPicker";
import { DoneView } from "../components/DoneView";
import { ErrorView } from "../components/ErrorView";
import { HeaderMenu } from "../components/HeaderMenu";
import { LessonView } from "../components/LessonView";
import { LoadingView } from "../components/LoadingView";
import { QuizView } from "../components/QuizView";
import { StreakStatus } from "../components/StreakStatus";
import { Card } from "../components/ui";

export function DailyLessonScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const state = useDailyLesson(user);
  const { phase, date, lesson, streak, selectedCategories, actions } = state;
  const [editingCategories, setEditingCategories] = useState(false);
  const [categoriesSaved, setCategoriesSaved] = useState(false);
  const canEditCategories = ["lesson", "quiz", "done"].includes(phase);
  const showCategoryPicker = phase === "categories" || (canEditCategories && editingCategories);
  const showCategoriesSetting = canEditCategories && !editingCategories;
  const streakCount = getStreakStatus(streak, date).count;

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
            <View style={styles.dateRow}>
              <Text style={{ color: theme.fgMuted, fontSize: 13 }}>{formatDateLabel(date)}</Text>
              {streakCount > 0 && (
                <View style={styles.streakBadge} accessibilityLabel={`${streakCount} ${streakCount === 1 ? "day" : "days"} streak`}>
                  <SymbolView name="flame.fill" size={13} tintColor={theme.accent} />
                  <Text style={{ color: theme.accent, fontSize: 12, fontWeight: "600" }}>{streakCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              <Text onPress={signOut} style={{ color: theme.fgMuted, fontSize: 12, fontWeight: "500", textDecorationLine: "underline" }}>
                Sign out
              </Text>
              <HeaderMenu
                showCategoriesSetting={showCategoriesSetting}
                categoryCount={selectedCategories.length}
                onEditCategories={() => {
                  setEditingCategories(true);
                  setCategoriesSaved(false);
                }}
              />
            </View>
          </View>
          {lesson?.category && (
            <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
              <Text style={{ color: theme.accent, fontSize: 12, fontWeight: "600" }}>{CATEGORIES[lesson.category]}</Text>
            </View>
          )}
        </View>

        {showCategoriesSetting && categoriesSaved && (
          <View style={styles.categoryToggle}>
            <Text style={{ color: theme.fgMuted, fontSize: 11 }}>Categories saved for future lessons.</Text>
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

        {(phase === "lesson" || phase === "done") && (
          <View style={styles.streak}>
            <StreakStatus streak={streak} date={date} />
          </View>
        )}

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
  const { phase, date, lesson, progress, quiz, errorMessage, actions } = state;
  if (phase === "loading") return <LoadingView text="Setting things up" />;
  if (phase === "generating") return <LoadingView text="Researching and checking today’s lesson" />;
  if (phase === "error") return <ErrorView message={errorMessage ?? "Unknown error"} onRetry={actions.retry} />;
  if (!lesson) return null;
  if (phase === "lesson") return <LessonView lesson={lesson} date={date} onStartQuiz={actions.startQuiz} />;
  if (phase === "quiz") return <QuizView lesson={lesson} quiz={quiz} onSelect={actions.selectOption} onNext={actions.nextQuestion} />;
  if (phase !== "done" || !progress) return null;
  return (
    <DoneView
      lesson={lesson}
      date={date}
      progress={progress}
      onMore={() => actions.adjustWeight(lesson.category, 4)}
      onLess={() => actions.adjustWeight(lesson.category, -4)}
    />
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 48 },
  header: { borderBottomWidth: 1, paddingBottom: 14, marginBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  badge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginTop: 14 },
  categoryToggle: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 20 },
  streak: { marginTop: 20 },
  footer: { borderTopWidth: 1, paddingTop: 12, marginTop: 24 },
});
