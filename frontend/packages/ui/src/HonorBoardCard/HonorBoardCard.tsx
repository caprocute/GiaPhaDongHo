"use client";

import { useId } from "react";
import styles from "./HonorBoardCard.module.css";

export interface HonorBoardCardProps {
  name: string;
  detail?: string;
  imageUrl?: string | null;
  emblem?: string;
  /** Biến thể trên nền tối */
  onDark?: boolean;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

const BIRD =
  "M0 0 C7-4 16-2 21 5 C14 3 9 8 5 12 C2 5-2 2 0 0ZM-2 2 C-12-7-26-4-32 5 C-22 0-12 5-4 9Z";

/** Vành trống đồng + chim lạc (thay nguyệt quế). */
function DrumChimLac({ gradId }: { gradId: string }) {
  const angles = [0, 60, 120, 180, 240, 300];
  return (
    <svg className={styles.drum} viewBox="0 0 320 320" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-heritage-soft)" />
          <stop offset="45%" stopColor="var(--color-heritage-accent)" />
          <stop offset="100%" stopColor="var(--color-heritage-deep)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${gradId})`} strokeWidth="1.6">
        <circle cx="160" cy="148" r="128" />
        <circle cx="160" cy="148" r="116" />
        <circle cx="160" cy="148" r="104" />
        <circle cx="160" cy="148" r="78" />
      </g>
      <g fill={`url(#${gradId})`} opacity={0.85}>
        <polygon points="160,20 168,32 152,32" />
        <polygon points="250,58 252,70 240,64" />
        <polygon points="288,148 276,156 276,140" />
        <polygon points="250,238 240,232 252,226" />
        <polygon points="160,276 152,264 168,264" />
        <polygon points="70,238 68,226 80,232" />
        <polygon points="32,148 44,140 44,156" />
        <polygon points="70,58 80,64 68,70" />
      </g>
      <g fill={`url(#${gradId})`}>
        {angles.map((deg) => (
          <g key={deg} transform={`translate(160 148) rotate(${deg}) translate(0 -110) scale(1.05)`}>
            <path d={BIRD} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function HonorBoardCard({
  name,
  detail,
  imageUrl,
  emblem,
  onDark = false,
}: HonorBoardCardProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `hb-drum-${uid}`;
  const fallback = emblem?.trim() || initialsFrom(name);

  return (
    <article className={onDark ? `${styles.root} ${styles.onDark}` : styles.root}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.rays} aria-hidden />
      <div className={styles.stage}>
        <DrumChimLac gradId={gradId} />
        <div className={styles.avatarRing}>
          {imageUrl ? (
            <img className={styles.avatarImg} src={imageUrl} alt="" />
          ) : (
            <span className={styles.avatarFallback} aria-hidden>
              {fallback}
            </span>
          )}
        </div>
        <div className={styles.ribbon}>
          <span className={styles.ribbonName}>{name}</span>
        </div>
      </div>
      {detail ? <p className={styles.detail}>{detail}</p> : null}
    </article>
  );
}
