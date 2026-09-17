import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth-context";
import { useTheme } from "../lib/theme";
import { Button, Card } from "../components/ui";

export function AccessPendingScreen({ status }: { status: "pending" | "revoked" }) {
  const theme = useTheme();
  const { user, signOut } = useAuth();

  const copy =
    status === "revoked"
      ? "Your access to this app has been revoked."
      : "Your access request has been sent. You'll be able to use the app once it's approved.";

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={[styles.title, { color: theme.fgStrong }]}>{status === "revoked" ? "Access revoked" : "Access requested"}</Text>
        <Text style={{ color: theme.fgMuted, fontSize: 14, textAlign: "center", marginTop: 8, marginBottom: 20 }}>
          {copy} Signed in as <Text style={{ color: theme.fg, fontWeight: "500" }}>{user?.email}</Text>.
        </Text>
        <Button title="Sign out" variant="secondary" onPress={signOut} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  card: { width: "100%", maxWidth: 360, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700" },
});
