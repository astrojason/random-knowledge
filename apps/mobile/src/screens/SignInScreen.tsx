import * as AppleAuthentication from "expo-apple-authentication";
import { Linking, ScrollView, StyleSheet, Text, useColorScheme } from "react-native";
import { CATEGORIES } from "@random-knowledge/shared/categories";
import { useAuth } from "../lib/auth-context";
import { useTheme } from "../lib/theme";
import { Card, Button } from "../components/ui";
import { ReviewerSignIn } from "../components/ReviewerSignIn";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const FEATURES = [
  {
    title: "A new topic every day",
    body: "Each day brings one short, AI-written lesson on a specific, narrow topic — never a broad overview you’ve seen before.",
  },
  {
    title: "A quick comprehension check",
    body: "A 3-question quiz right after the lesson checks what stuck, with a short explanation for each answer.",
  },
  {
    title: "Dozens of categories to explore",
    body: `From ${Object.values(CATEGORIES).slice(0, 3).join(", ")}, and many more.`,
  },
  {
    title: "Your streak, tracked",
    body: "Come back daily and Random Knowledge keeps count, so your learning habit builds visible momentum.",
  },
];

export function SignInScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === "dark";
  const { signIn, signInApple, error } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={[styles.title, { color: theme.fgStrong }]}>Random Knowledge</Text>
      <Text style={{ color: theme.fgMuted, fontSize: 16, textAlign: "center", marginTop: 12, marginBottom: 28 }}>
        One short, AI-generated lesson a day — plus a quick quiz to check what stuck — so a five-minute habit
        turns into real, remembered knowledge.
      </Text>

      {FEATURES.map((f) => (
        <Card key={f.title} style={styles.feature}>
          <Text style={{ color: theme.fgStrong, fontSize: 15, fontWeight: "600" }}>{f.title}</Text>
          <Text style={{ color: theme.fgMuted, fontSize: 13, marginTop: 6 }}>{f.body}</Text>
        </Card>
      ))}

      <Card style={styles.signIn}>
        <Text style={{ color: theme.fgMuted, fontSize: 13, textAlign: "center", marginBottom: 20 }}>
          Random Knowledge is currently invite-only. Sign in to request access — you&apos;ll be
          able to use the app as soon as it&apos;s approved.
        </Text>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={
            isDark
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={8}
          style={styles.appleButton}
          onPress={signInApple}
        />
        <Button title="Sign in with Google" onPress={signIn} />
        <ReviewerSignIn />
        {error && <Text style={{ color: theme.rust, fontSize: 13, marginTop: 14, textAlign: "center" }}>{error}</Text>}
        {API_BASE_URL && (
          <Text style={{ color: theme.fgMuted, fontSize: 11, marginTop: 18, textAlign: "center" }}>
            By signing in you agree to the{" "}
            <Text style={{ color: theme.accent }} onPress={() => Linking.openURL(`${API_BASE_URL}/terms`)}>
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text style={{ color: theme.accent }} onPress={() => Linking.openURL(`${API_BASE_URL}/privacy`)}>
              Privacy Policy
            </Text>
            .
          </Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 48, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: "700", textAlign: "center" },
  feature: { marginBottom: 12 },
  signIn: { marginTop: 12, alignItems: "center" },
  appleButton: { width: "100%", height: 44, marginBottom: 12 },
});
