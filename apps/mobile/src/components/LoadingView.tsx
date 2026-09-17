import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../lib/theme";

export function LoadingView({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.rust} />
      <Text style={[styles.text, { color: theme.fgMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 64 },
  text: { fontSize: 14 },
});
