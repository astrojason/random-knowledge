import { Linking, StyleSheet, Text, View } from "react-native";
import type { Lesson } from "@random-knowledge/shared/types";
import { useTheme } from "../lib/theme";

export function LessonBody({ lesson }: { lesson: Lesson }) {
  const theme = useTheme();
  return (
    <View>
      <Text style={[styles.title, { color: theme.fgStrong }]}>{lesson.title}</Text>
      <View style={styles.body}>
        {lesson.body.map((paragraph, i) => (
          <Text key={i} style={[styles.paragraph, { color: theme.fg }]}>
            {paragraph}
            {lesson.paragraphSources?.[i]?.map((id) => {
              const source = lesson.sources?.[id - 1];
              if (!source) return null;
              return (
                <Text
                  key={id}
                  onPress={() => Linking.openURL(source.url)}
                  style={{ color: theme.accent, fontSize: 11, fontWeight: "700" }}
                >
                  {" "}[{id}]
                </Text>
              );
            })}
          </Text>
        ))}
      </View>
      {lesson.sources?.length ? (
        <View style={[styles.sources, { borderColor: theme.border }]}>
          <Text style={[styles.sourcesTitle, { color: theme.fgMuted }]}>Sources</Text>
          {lesson.sources.map((source, i) => (
            <Text
              key={source.url}
              onPress={() => Linking.openURL(source.url)}
              style={{ color: theme.accent, fontSize: 12, marginBottom: 4, textDecorationLine: "underline" }}
            >
              {i + 1}. {source.title}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={{ color: theme.fgMuted, fontSize: 12, marginVertical: 12 }}>
          This saved lesson predates source checks and has no source references.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", lineHeight: 30, marginBottom: 14 },
  body: { marginBottom: 4 },
  paragraph: { fontSize: 16, lineHeight: 24, marginBottom: 14 },
  sources: { borderTopWidth: 1, paddingTop: 12, marginVertical: 16 },
  sourcesTitle: { fontSize: 12, fontWeight: "600", marginBottom: 8 },
});
