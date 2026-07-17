"use client";

import { useTheme } from "./ThemeProvider";
import {
  COLOR_MODES,
  MODE_LABELS,
  PALETTE_IDS,
  PALETTE_LABELS,
  type ColorMode,
  type PaletteId,
} from "./themeTypes";
import styles from "./AppearanceControl.module.css";

export interface AppearanceControlProps {
  /** Nền utility tối (header) — mặc định true */
  onBrandBar?: boolean;
  className?: string;
}

export function AppearanceControl({ onBrandBar = true, className }: AppearanceControlProps) {
  const { palette, mode, setPalette, setMode } = useTheme();
  const rootClass = [
    styles.root,
    onBrandBar ? "" : styles.onLight,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} role="group" aria-label="Giao diện">
      <div className={styles.group}>
        <label className={styles.label} htmlFor="giapha-palette">
          Màu
        </label>
        <select
          id="giapha-palette"
          className={styles.select}
          value={palette}
          onChange={(e) => setPalette(e.target.value as PaletteId)}
        >
          {PALETTE_IDS.map((id) => (
            <option key={id} value={id}>
              {PALETTE_LABELS[id]}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.group}>
        <label className={styles.label} htmlFor="giapha-mode">
          Nền
        </label>
        <select
          id="giapha-mode"
          className={styles.select}
          value={mode}
          onChange={(e) => setMode(e.target.value as ColorMode)}
        >
          {COLOR_MODES.map((id) => (
            <option key={id} value={id}>
              {MODE_LABELS[id]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
