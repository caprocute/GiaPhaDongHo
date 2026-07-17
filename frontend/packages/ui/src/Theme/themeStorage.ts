import {
  DEFAULT_APPEARANCE,
  THEME_STORAGE_KEY,
  isColorMode,
  isPaletteId,
  type AppearanceState,
} from "./themeTypes";

export function readAppearance(): AppearanceState {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    const parsed = JSON.parse(raw) as Partial<AppearanceState>;
    return {
      palette: isPaletteId(parsed.palette) ? parsed.palette : DEFAULT_APPEARANCE.palette,
      mode: isColorMode(parsed.mode) ? parsed.mode : DEFAULT_APPEARANCE.mode,
    };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function writeAppearance(state: AppearanceState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / private mode */
  }
}
