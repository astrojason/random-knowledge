import { useState } from "react";
import { Alert, Text } from "react-native";
import { useAuth } from "../lib/auth-context";
import { deleteAccount, needsPasswordToDelete } from "../lib/deleteAccount";
import { useTheme } from "../lib/theme";
import { LinkText } from "./ui";

/** "Delete account" for the menu: confirms, asks for the password when the account has one, and shows any failure. */
export function DeleteAccountLink() {
  const theme = useTheme();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function run(password?: string) {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAccount(user, password);
    } catch (err) {
      console.error("Account deletion failed", err);
      setError(err instanceof Error ? err.message : "Couldn't delete your account.");
    } finally {
      setBusy(false);
    }
  }

  function confirm() {
    if (!user) return;
    Alert.alert(
      "Delete your account?",
      "This permanently deletes your account, streak, lessons and preferences. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: () => {
            if (needsPasswordToDelete(user)) {
              Alert.prompt("Confirm your password", "Enter your password to delete your account.", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: (password?: string) => void run(password) },
              ], "secure-text");
            } else {
              void run();
            }
          },
        },
      ]
    );
  }

  return (
    <>
      <LinkText title={busy ? "Deleting account…" : "Delete account"} onPress={busy ? () => undefined : confirm} />
      {error && (
        <Text selectable style={{ color: theme.rust, fontSize: 12, marginTop: 8 }}>
          {error}
        </Text>
      )}
    </>
  );
}
