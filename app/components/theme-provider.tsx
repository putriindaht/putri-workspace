"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  defaultPreferences,
  parsePreferences,
  THEME_STORAGE_KEY,
  type Appearance,
  type ColorMode,
  type ThemePreferences,
} from "../../lib/themes";

type ThemeContextValue = ThemePreferences & {
  resolvedMode: ColorMode;
  setAppearance: (appearance: Appearance) => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] =
    useState<ThemePreferences>(defaultPreferences);
  const [systemMode, setSystemMode] = useState<ColorMode>("light");
  const [ready, setReady] = useState(false);
  const resolvedMode =
    preferences.appearance === "system" ? systemMode : preferences.appearance;

  useEffect(() => {
    try {
      setPreferences(parsePreferences(localStorage.getItem(THEME_STORAGE_KEY)));
    } catch {
      /* Theme switching still works when browser storage is unavailable. */
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => setSystemMode(media.matches ? "dark" : "light");
    syncSystem();
    setReady(true);
    media.addEventListener("change", syncSystem);
    const syncStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null)
        setPreferences(parsePreferences(event.newValue));
    };
    window.addEventListener("storage", syncStorage);
    return () => {
      media.removeEventListener("change", syncSystem);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.dataset.palette = preferences.palette;
    root.dataset.appearance = preferences.appearance;
    root.dataset.colorMode = resolvedMode;
  }, [preferences, resolvedMode, ready]);

  function update(next: ThemePreferences) {
    setPreferences(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* Retain the choice for this visit even if saving is blocked. */
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        ...preferences,
        resolvedMode,
        setAppearance: (appearance) => update({ ...preferences, appearance }),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
