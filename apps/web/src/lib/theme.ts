export const THEME_VALUES = ["paper", "dusk"] as const;
export type Theme = (typeof THEME_VALUES)[number];

export const STORAGE_KEY = "random-knowledge-theme";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return (THEME_VALUES as readonly string[]).includes(value ?? "")
    ? (value as Theme)
    : null;
}

export function applyTheme(theme: Theme | null): void {
  if (typeof document === "undefined") return;
  if (theme) {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((listener) => listener());
}

const listeners = new Set<() => void>();

/** For useSyncExternalStore — theme lives outside React (localStorage + a DOM attribute). */
export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getServerTheme(): Theme | null {
  return null;
}
