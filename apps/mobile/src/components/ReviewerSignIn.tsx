import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../lib/auth-context";
import { useTheme } from "../lib/theme";
import { Button, LinkText } from "./ui";

/** Collapsed by default; lets App Review sign in with the demo account's email/password. */
export function ReviewerSignIn() {
  const theme = useTheme();
  const { signInEmail } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!open) {
    return (
      <View style={styles.wrap}>
        <LinkText title="App Review sign-in" onPress={() => setOpen(true)} />
      </View>
    );
  }

  const inputStyle = [styles.input, { color: theme.fg, borderColor: theme.border }];
  return (
    <View style={styles.wrap}>
      <Text style={{ color: theme.fgMuted, fontSize: 12, marginBottom: 8, textAlign: "center" }}>
        Sign in with the demo account provided to App Review.
      </Text>
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
      />
      <Button title="Sign in" onPress={() => signInEmail(email, password)} disabled={!email || !password} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, width: "100%", alignItems: "center" },
  input: { width: "100%", borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 15 },
});
