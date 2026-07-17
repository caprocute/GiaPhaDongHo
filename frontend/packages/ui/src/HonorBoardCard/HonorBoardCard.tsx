"use client";

import { useId } from "react";
import styles from "./HonorBoardCard.module.css";

export interface HonorBoardCardProps {
  name: string;
  detail?: string;
  imageUrl?: string | null;
  emblem?: string;
  onDark?: boolean;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

/** Nền scene: mây + núi + vành trống đồng mờ */
function SceneBackdrop() {
  return (
    <svg className={styles.sceneArt} viewBox="0 0 400 360" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" stroke="var(--color-heritage-accent)" strokeOpacity="0.16" strokeWidth="1.1">
        <circle cx="200" cy="150" r="72" />
        <circle cx="200" cy="150" r="98" />
        <circle cx="200" cy="150" r="124" />
      </g>
      <g fill="none" stroke="var(--color-heritage-deep)" strokeOpacity="0.4" strokeWidth="1.25" strokeLinecap="round">
        <path d="M36 52 C52 38 78 38 90 54 C104 40 128 44 136 62 C118 70 78 72 52 66 C42 74 30 66 36 52Z" />
        <path d="M270 44 C290 30 318 34 330 52 C348 38 372 44 380 62 C358 70 320 72 292 64 C280 72 264 62 270 44Z" />
      </g>
      <g fill="none" stroke="var(--color-heritage-deep)" strokeOpacity="0.38" strokeWidth="1.3" strokeLinejoin="round">
        <path d="M0 270 L55 220 L100 250 L160 195 L220 245 L280 205 L340 240 L400 215 L400 360 L0 360Z" />
        <path d="M0 295 L70 250 L130 280 L190 235 L260 275 L330 245 L400 270" opacity="0.7" />
      </g>
    </svg>
  );
}

/** Vòng chim lạc trống đồng quanh avatar */
function LacBirdRing({ gradId }: { gradId: string }) {
  const birds = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg className={styles.lacRing} viewBox="0 0 320 320" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-heritage-soft)" />
          <stop offset="50%" stopColor="var(--color-heritage-accent)" />
          <stop offset="100%" stopColor="var(--color-heritage-deep)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${gradId})`} strokeWidth="1.6" opacity="0.85">
        <circle cx="160" cy="148" r="108" />
        <circle cx="160" cy="148" r="98" />
      </g>
      <circle
        cx="160"
        cy="148"
        r="103"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="3.2"
        strokeDasharray="4 7"
        opacity="0.55"
      />
      <g fill={`url(#${gradId})`} stroke={`url(#${gradId})`} strokeWidth="0.55">
        {birds.map((deg) => (
          <g key={deg} transform={`rotate(${deg} 160 148) translate(160 40)`}>
            <path d="M0 0 C8 -4 18 -2 22 6 C12 4 6 8 0 14 C2 6 -2 2 0 0Z" />
            <path
              d="M6 2 C14 -8 24 -6 26 2"
              fill="none"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
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
  const gradId = `hb-lac-${uid}`;
  const fallback = emblem?.trim() || initialsFrom(name);

  return (
    <article className={onDark ? `${styles.root} ${styles.onDark}` : styles.root}>
      <SceneBackdrop />
      <div className={styles.glow} aria-hidden />
      <div className={styles.rays} aria-hidden />
      <div className={styles.stage}>
        <LacBirdRing gradId={gradId} />
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
