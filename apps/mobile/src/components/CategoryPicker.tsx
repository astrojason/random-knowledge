import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from "@random-knowledge/shared/categories";
import { useTheme } from "../lib/theme";
import { Button, LinkText } from "./ui";

export function CategoryPicker({
  selectedCategories,
  onSave,
  onCancel,
}: {
  selectedCategories: CategoryKey[];
  onSave: (categories: CategoryKey[]) => Promise<void>;
  onCancel?: () => void;
}) {
  const theme = useTheme();
  const [selected, setSelected] = useState(selectedCategories);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: CategoryKey) {
    setSelected((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));
  }

  async function save() {
    if (saving || !selected.length) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your categories. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.fgStrong }]}>What would you like to learn?</Text>
      <Text style={{ color: theme.fgMuted, fontSize: 13, marginTop: 8, marginBottom: 14 }}>
        Choose at least one category.{" "}
        {onCancel ? "Changes apply to future lessons; today’s lesson stays the same." : "Your daily lessons will come from your selections. You can change them anytime."}
      </Text>
      <View style={styles.linkRow}>
        <LinkText title="Select all" onPress={() => setSelected([...CATEGORY_KEYS])} />
        <LinkText title="Clear all" onPress={() => setSelected([])} />
      </View>
      {CATEGORY_KEYS.map((key) => {
        const isSelected = selected.includes(key);
        return (
          <Pressable
            key={key}
            onPress={() => toggle(key)}
            style={[
              styles.row,
              { borderColor: isSelected ? theme.accent : theme.border, backgroundColor: isSelected ? theme.accentSoft : "transparent" },
            ]}
          >
            <View style={[styles.checkbox, { borderColor: isSelected ? theme.accent : theme.fgMuted, backgroundColor: isSelected ? theme.accent : "transparent" }]}>
              {isSelected && <Text style={{ color: theme.accentFg, fontSize: 11, fontWeight: "700" }}>{"✓"}</Text>}
            </View>
            <Text style={{ color: isSelected ? theme.accent : theme.fgMuted, fontSize: 14, flex: 1 }}>{CATEGORIES[key]}</Text>
          </Pressable>
        );
      })}
      <Text style={{ color: theme.fgMuted, fontSize: 12, marginTop: 8 }}>
        {selected.length ? `${selected.length} of ${CATEGORY_KEYS.length} selected` : "Choose at least one category to continue."}
      </Text>
      {error && <Text style={{ color: theme.rust, fontSize: 14, marginTop: 8 }}>{error}</Text>}
      <View style={styles.actions}>
        <Button title={saving ? "Saving…" : onCancel ? "Save categories" : "Start learning"} onPress={save} disabled={saving || !selected.length} />
        {onCancel && (
          <View style={{ marginTop: 10 }}>
            <LinkText title="Cancel" onPress={onCancel} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, paddingBottom: 20, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "700" },
  linkRow: { flexDirection: "row", gap: 16, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 6, borderWidth: 1, padding: 12, marginBottom: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  actions: { marginTop: 12 },
});
