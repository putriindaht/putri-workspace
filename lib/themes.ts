export type Appearance = "system" | "light" | "dark";
export type ColorMode = "light" | "dark";
export type ThemeColors = {
  background: string;
  sidebar: string;
  surface: string;
  primary: string;
  accent: string;
  foreground: string;
  mutedForeground: string;
  border: string;
};
export type Palette = {
  id: string;
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
};
export const THEME_STORAGE_KEY = "putri-workspace-theme";
export const DEFAULT_PALETTE = "midnight-indigo";
export const palettes: Palette[] = [
  {
    id: "midnight-indigo",
    name: "Midnight Indigo",
    dark: {
      background: "#0F1220",
      sidebar: "#191E30",
      surface: "#252C43",
      primary: "#6366F1",
      accent: "#A5B4FC",
      foreground: "#F1F4FF",
      mutedForeground: "#A8B3CF",
      border: "#343D58",
    },
    light: {
      background: "#F8FAFF",
      sidebar: "#EEF1F9",
      surface: "#FFFFFF",
      primary: "#4F46E5",
      accent: "#4F46E5",
      foreground: "#18213A",
      mutedForeground: "#64748B",
      border: "#DCE3F0",
    },
  },
];
export type ThemePreferences = { palette: string; appearance: Appearance };
export const defaultPreferences: ThemePreferences = {
  palette: DEFAULT_PALETTE,
  appearance: "system",
};
export function parsePreferences(value: string | null): ThemePreferences {
  try {
    const parsed = JSON.parse(value || "null");
    return {
      palette: palettes.some((p) => p.id === parsed?.palette)
        ? parsed.palette
        : DEFAULT_PALETTE,
      appearance: ["system", "light", "dark"].includes(parsed?.appearance)
        ? parsed.appearance
        : "system",
    };
  } catch {
    return { ...defaultPreferences };
  }
}
