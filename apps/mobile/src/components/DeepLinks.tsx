import { Linking, StyleSheet, Text, View } from "react-native";
import type { Lesson } from "@random-knowledge/shared/types";
import { useTheme } from "../lib/theme";

export function DeepLinks({ lesson }: { lesson: Lesson }) {
  const theme = useTheme();
  if (!lesson.wikiQuery && !lesson.youtubeQuery) return null;

  return (
    <View style={styles.row}>
      {lesson.wikiQuery && (
        <Text
          onPress={() => Linking.openURL(`https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(lesson.wikiQuery)}`)}
          style={{ color: theme.accent, fontSize: 13, fontWeight: "500", textDecorationLine: "underline" }}
        >
          Go deeper on Wikipedia
        </Text>
      )}
      {lesson.youtubeQuery && (
        <Text
          onPress={() => Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.youtubeQuery)}`)}
          style={{ color: theme.rust, fontSize: 13, fontWeight: "500", textDecorationLine: "underline" }}
        >
          Find a YouTube explainer
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 4, marginBottom: 16 },
});
