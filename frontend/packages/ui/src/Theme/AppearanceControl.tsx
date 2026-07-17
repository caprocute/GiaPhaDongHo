"use client";

import { Flame, Monitor, Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import {
  MODE_LABELS,
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

const PALETTE_BTNS: {
  id: PaletteId;
  icon: typeof Sparkles;
}[] = [
  { id: "bang-vang", icon: Sparkles },
  { id: "co", icon: Flame },
];

const MODE_BTNS: {
  id: ColorMode;
  icon: typeof Sun;
}[] = [
  { id: "light", icon: Sun },
  { id: "dark", icon: Moon },
  { id: "system", icon: Monitor },
];

export function AppearanceControl({ onBrandBar = true, className }: AppearanceControlProps) {
  const { palette, mode, setPalette, setMode } = useTheme();
  const rootClass = [styles.root, onBrandBar ? "" : styles.onLight, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} role="group" aria-label="Giao diện">
      <div className={styles.seg} role="group" aria-label="Bộ màu">
        {PALETTE_BTNS.map(({ id, icon: Icon }) => {
          const active = palette === id;
          return (
            <button
              key={id}
              type="button"
              className={active ? `${styles.btn} ${styles.btnActive}` : styles.btn}
              aria-label={PALETTE_LABELS[id]}
              aria-pressed={active}
              title={PALETTE_LABELS[id]}
              onClick={() => setPalette(id)}
            >
              <Icon size={14} strokeWidth={2.25} aria-hidden />
            </button>
          );
        })}
      </div>

      <div className={styles.seg} role="group" aria-label="Nền sáng tối">
        {MODE_BTNS.map(({ id, icon: Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              className={active ? `${styles.btn} ${styles.btnActive}` : styles.btn}
              aria-label={MODE_LABELS[id]}
              aria-pressed={active}
              title={MODE_LABELS[id]}
              onClick={() => setMode(id)}
            >
              <Icon size={14} strokeWidth={2.25} aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}
