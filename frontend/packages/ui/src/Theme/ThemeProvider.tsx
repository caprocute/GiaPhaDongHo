"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyTheme } from "./applyTheme";
import { readAppearance, writeAppearance } from "./themeStorage";
import {
  DEFAULT_APPEARANCE,
  type ColorMode,
  type PaletteId,
  type ResolvedMode,
} from "./themeTypes";

export type ThemeContextValue = {
  palette: PaletteId;
  mode: ColorMode;
  resolvedMode: ResolvedMode;
  setPalette: (palette: PaletteId) => void;
  setMode: (mode: ColorMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function initialAppearance() {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;
  return readAppearance();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteId>(() => initialAppearance().palette);
  const [mode, setModeState] = useState<ColorMode>(() => initialAppearance().mode);
  const [resolvedMode, setResolvedMode] = useState<ResolvedMode>(() =>
    applyTheme(initialAppearance().palette, initialAppearance().mode),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readAppearance();
    setPaletteState(stored.palette);
    setModeState(stored.mode);
    setResolvedMode(applyTheme(stored.palette, stored.mode));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const resolved = applyTheme(palette, mode);
    setResolvedMode(resolved);
    writeAppearance({ palette, mode });
  }, [palette, mode, hydrated]);

  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedMode(applyTheme(palette, "system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode, palette]);

  const setPalette = useCallback((next: PaletteId) => setPaletteState(next), []);
  const setMode = useCallback((next: ColorMode) => setModeState(next), []);

  const value = useMemo(
    () => ({ palette, mode, resolvedMode, setPalette, setMode }),
    [palette, mode, resolvedMode, setPalette, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme phải dùng trong ThemeProvider");
  }
  return ctx;
}
