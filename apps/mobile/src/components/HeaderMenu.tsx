import { useEffect, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useTheme } from "../lib/theme";
import { LinkText } from "./ui";

const PANEL_WIDTH = 280;

/** A right-side sliding menu, opened from a hamburger button. Settings live here so the header row stays to just the date and sign out. */
export function HeaderMenu({
  showCategoriesSetting,
  categoryCount,
  onEditCategories,
}: {
  showCategoriesSetting: boolean;
  categoryCount: number;
  onEditCategories: () => void;
}) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [translateX] = useState(() => new Animated.Value(PANEL_WIDTH));

  useEffect(() => {
    if (!visible) return;
    translateX.setValue(PANEL_WIDTH);
    Animated.timing(translateX, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  }, [visible, translateX]);

  function close() {
    Animated.timing(translateX, { toValue: PANEL_WIDTH, duration: 180, useNativeDriver: true }).start(() => setVisible(false));
  }

  return (
    <>
      <Pressable onPress={() => setVisible(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Open menu">
        <SymbolView name="line.3.horizontal" size={20} tintColor={theme.fgMuted} />
      </Pressable>

      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        <View style={styles.root}>
          <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close menu" />
          <Animated.View
            style={[
              styles.panel,
              { backgroundColor: theme.surface, borderColor: theme.border, transform: [{ translateX }] },
            ]}
          >
            <View style={styles.panelHeader}>
              <Text style={{ color: theme.fgStrong, fontSize: 17, fontWeight: "700" }}>Menu</Text>
              <Pressable onPress={close} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close menu">
                <SymbolView name="xmark" size={18} tintColor={theme.fgMuted} />
              </Pressable>
            </View>

            {showCategoriesSetting && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.fgMuted }]}>Settings</Text>
                <LinkText
                  title={`My categories (${categoryCount})`}
                  onPress={() => {
                    onEditCategories();
                    close();
                  }}
                />
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" },
  panel: {
    width: PANEL_WIDTH,
    borderLeftWidth: 1,
    padding: 20,
    paddingTop: 60,
  },
  panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  section: { marginTop: 4 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 10, textTransform: "uppercase" },
});
