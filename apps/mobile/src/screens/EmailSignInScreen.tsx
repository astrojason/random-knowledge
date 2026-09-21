import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { useAuth } from "../lib/auth-context";
import { useTheme } from "../lib/theme";
import { Button, Card, LinkText } from "../components/ui";

/** Email/password sign-in, for accounts created by the admin (e.g. the App Review demo account). */
export function EmailSignInScreen({ onBack }: { onBack: () => void }) {
  const theme = useTheme();
  const { signInEmail, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    await signInEmail(email, password);
    setSubmitting(false);
  };

  const inputStyle = [styles.input, { color: theme.fg, borderColor: theme.border }];
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.fgStrong }]}>Sign in with email</Text>
        <Text style={{ color: theme.fgMuted, fontSize: 14, textAlign: "center", marginTop: 12, marginBottom: 24 }}>
          For accounts that have been given an email and password, such as the App Review demo account.
        </Text>
        <Card style={styles.card}>
          <TextInput
            style={inputStyle}
            placeholder="Email"
            placeholderTextColor={theme.fgMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={inputStyle}
            placeholder="Password"
            placeholderTextColor={theme.fgMuted}
            secureTextEntry
            textContentType="password"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={submit}
          />
          <Button title="Sign in" onPress={submit} disabled={!email || !password || submitting} />
          {error && <Text style={{ color: theme.rust, fontSize: 13, marginTop: 14, textAlign: "center" }}>{error}</Text>}
        </Card>
        <Text style={styles.back}>
          <LinkText title="Back to sign-in options" onPress={onBack} />
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 20, paddingTop: 48, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center" },
  card: { alignItems: "center" },
  input: { width: "100%", borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
  back: { marginTop: 20, textAlign: "center" },
});
