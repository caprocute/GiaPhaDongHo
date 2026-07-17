export const PALETTE_IDS = ["bang-vang", "co"] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];

export const COLOR_MODES = ["light", "dark", "system"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export type ResolvedMode = "light" | "dark";

export type AppearanceState = {
  palette: PaletteId;
  mode: ColorMode;
};

export const DEFAULT_APPEARANCE: AppearanceState = {
  palette: "bang-vang",
  mode: "system",
};

export const THEME_STORAGE_KEY = "giapha.appearance";

export const PALETTE_LABELS: Record<PaletteId, string> = {
  "bang-vang": "Bảng vàng",
  co: "Cổ (son đỏ)",
};

export const MODE_LABELS: Record<ColorMode, string> = {
  light: "Sáng",
  dark: "Tối",
  system: "Theo hệ thống",
};

export function isPaletteId(v: unknown): v is PaletteId {
  return typeof v === "string" && (PALETTE_IDS as readonly string[]).includes(v);
}

export function isColorMode(v: unknown): v is ColorMode {
  return typeof v === "string" && (COLOR_MODES as readonly string[]).includes(v);
}
