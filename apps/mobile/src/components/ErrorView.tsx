import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../lib/theme";
import { Button } from "./ui";

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text style={{ color: theme.fgMuted, fontSize: 14 }}>Couldn&apos;t load today&apos;s lesson.</Text>
      <Text style={{ color: theme.rust, fontSize: 13 }}>{message}</Text>
      <View style={styles.button}>
        <Button title="Try again" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 48 },
  button: { marginTop: 8 },
});
