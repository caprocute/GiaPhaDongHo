"use client";

import { useId } from "react";
import styles from "./HonorBoardCard.module.css";

export interface HonorBoardCardProps {
  name: string;
  detail?: string;
  /** URL ảnh chân dung — nếu trống dùng emblem/initials */
  imageUrl?: string | null;
  /** Chữ Hán/ký hiệu trong avatar khi không có ảnh (壽, 德…) */
  emblem?: string;
  /** Nền son thẫm (khối Bảng vàng công đức trang chủ) */
  onDark?: boolean;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function LaurelWreath({ gradId }: { gradId: string }) {
  return (
    <svg className={styles.laurel} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-heritage-soft)" />
          <stop offset="55%" stopColor="var(--color-heritage-accent)" />
          <stop offset="100%" stopColor="var(--color-heritage-deep)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="round">
        <path d="M96 168 C70 150 48 120 42 88 C38 62 48 42 62 36" />
        <path d="M58 48 C48 52 42 62 40 72" />
        <path d="M52 78 C42 84 38 96 38 108" />
        <path d="M48 118 C40 126 38 138 42 148" />
        <path d="M62 156 C52 160 48 168 50 176" />
      </g>
      <g fill={`url(#${gradId})`}>
        <ellipse cx="54" cy="44" rx="9" ry="4.5" transform="rotate(-55 54 44)" />
        <ellipse cx="44" cy="66" rx="10" ry="4.8" transform="rotate(-40 44 66)" />
        <ellipse cx="40" cy="92" rx="11" ry="5" transform="rotate(-18 40 92)" />
        <ellipse cx="42" cy="118" rx="10" ry="4.8" transform="rotate(8 42 118)" />
        <ellipse cx="52" cy="142" rx="10" ry="4.6" transform="rotate(28 52 142)" />
        <ellipse cx="68" cy="160" rx="9" ry="4.2" transform="rotate(48 68 160)" />
        <ellipse cx="84" cy="170" rx="8" ry="3.8" transform="rotate(62 84 170)" />
      </g>
      <g fill="none" stroke={`url(#${gradId})`} strokeWidth="2.2" strokeLinecap="round">
        <path d="M104 168 C130 150 152 120 158 88 C162 62 152 42 138 36" />
        <path d="M142 48 C152 52 158 62 160 72" />
        <path d="M148 78 C158 84 162 96 162 108" />
        <path d="M152 118 C160 126 162 138 158 148" />
        <path d="M138 156 C148 160 152 168 150 176" />
      </g>
      <g fill={`url(#${gradId})`}>
        <ellipse cx="146" cy="44" rx="9" ry="4.5" transform="rotate(55 146 44)" />
        <ellipse cx="156" cy="66" rx="10" ry="4.8" transform="rotate(40 156 66)" />
        <ellipse cx="160" cy="92" rx="11" ry="5" transform="rotate(18 160 92)" />
        <ellipse cx="158" cy="118" rx="10" ry="4.8" transform="rotate(-8 158 118)" />
        <ellipse cx="148" cy="142" rx="10" ry="4.6" transform="rotate(-28 148 142)" />
        <ellipse cx="132" cy="160" rx="9" ry="4.2" transform="rotate(-48 132 160)" />
        <ellipse cx="116" cy="170" rx="8" ry="3.8" transform="rotate(-62 116 170)" />
      </g>
      <path
        d="M88 172 Q100 182 112 172 M92 176 L100 188 L108 176"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const gradId = `hb-leaf-${uid}`;
  const fallback = emblem?.trim() || initialsFrom(name);

  return (
    <article className={onDark ? `${styles.root} ${styles.onDark}` : styles.root}>
      <div className={styles.rays} aria-hidden />
      <div className={styles.stage}>
        <LaurelWreath gradId={gradId} />
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
