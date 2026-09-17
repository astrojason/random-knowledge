import { useColorScheme } from "react-native";

// Mirrors apps/web/src/theme.css's default (OS-preference) palette.
const palettes = {
  light: {
    bg: "#e9e1cc",
    surface: "#f2ecdd",
    border: "#e3dac2",
    fg: "#2a2a28",
    fgStrong: "#1c2b39",
    fgMuted: "#6b6357",
    accent: "#2f6e68",
    accentFg: "#f2ecdd",
    accentSoft: "rgba(47, 110, 104, 0.09)",
    rust: "#b8622e",
    rustFg: "#f2ecdd",
    correct: "rgba(47, 110, 104, 0.16)",
    incorrect: "rgba(184, 98, 46, 0.14)",
  },
  dark: {
    bg: "#141b22",
    surface: "#1c2730",
    border: "#2c3944",
    fg: "#dcd6c8",
    fgStrong: "#f2ecdd",
    fgMuted: "#8b9199",
    accent: "#5fb3aa",
    accentFg: "#10201d",
    accentSoft: "rgba(95, 179, 170, 0.14)",
    rust: "#e08a55",
    rustFg: "#201209",
    correct: "rgba(95, 179, 170, 0.2)",
    incorrect: "rgba(224, 138, 85, 0.18)",
  },
} as const satisfies Record<"light" | "dark", Record<string, string>>;

export type Palette = Record<keyof typeof palettes.light, string>;

export function useTheme(): Palette {
  const scheme = useColorScheme();
  return palettes[scheme === "dark" ? "dark" : "light"];
}
