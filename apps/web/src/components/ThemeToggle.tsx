"use client";

import { useSyncExternalStore } from "react";
import { applyTheme, getServerTheme, getStoredTheme, subscribeToTheme, type Theme } from "@/lib/theme";

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getStoredTheme, getServerTheme);

  const toggle = () => {
    const prefersDark =
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentlyDark = theme ? theme === "dusk" : prefersDark;
    const next: Theme = currentlyDark ? "paper" : "dusk";
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="text-xs font-medium text-fg-muted underline decoration-border decoration-1 underline-offset-2 hover:text-accent"
    >
      {theme === "dusk" ? "Light" : "Dark"}
    </button>
  );
}
