import type { AppearanceState, ColorMode, PaletteId, ResolvedMode } from "./themeTypes";

export function resolveMode(mode: ColorMode, prefersDark?: boolean): ResolvedMode {
  if (mode === "light" || mode === "dark") return mode;
  if (typeof prefersDark === "boolean") return prefersDark ? "dark" : "light";
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export function applyTheme(
  palette: PaletteId,
  mode: ColorMode,
  root: HTMLElement = typeof document !== "undefined" ? document.documentElement : (null as unknown as HTMLElement),
): ResolvedMode {
  const resolved = resolveMode(mode);
  if (!root) return resolved;
  root.setAttribute("data-palette", palette);
  root.setAttribute("data-mode", resolved);
  root.style.colorScheme = resolved;
  return resolved;
}

export function applyAppearance(state: AppearanceState): ResolvedMode {
  return applyTheme(state.palette, state.mode);
}
