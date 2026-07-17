import type { CSSProperties } from "react";

export interface ClanSealProps {
  className?: string;
  size?: number;
  /** Biến thể nhỏ gọn (sidebar CRM) */
  compact?: boolean;
}

/** Ấn tổ / triện dòng họ — dùng chung portal masthead & admin sidebar. */
export function ClanSeal({ className, size, compact = false }: ClanSealProps) {
  const style: CSSProperties | undefined =
    size != null
      ? { width: size, height: size, flex: "none" }
      : compact
        ? { width: 38, height: 38, flex: "none" }
        : undefined;

  if (compact) {
    return (
      <svg className={className} style={style} viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r="33" fill="none" stroke="var(--color-heritage-accent)" strokeWidth="3" />
        <circle cx="36" cy="36" r="27" fill="var(--color-heritage-frame)" />
        <path
          d="M36 48 V29 M36 36 L27 27 M36 36 L45 27"
          stroke="var(--color-heritage-soft)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M28 48 h16" stroke="var(--color-heritage-accent)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={className} style={style} viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="34" fill="none" stroke="var(--color-heritage-accent)" strokeWidth="2" />
      <circle
        cx="36"
        cy="36"
        r="30.5"
        fill="none"
        stroke="var(--color-heritage-accent)"
        strokeWidth=".8"
        opacity=".7"
      />
      <circle cx="36" cy="36" r="26" fill="var(--color-heritage-frame)" />
      <path
        d="M36 50 V30 M36 37 L26 27 M36 37 L46 27 M36 30 L30 22.5 M36 30 L42 22.5"
        stroke="var(--color-heritage-soft)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="26" cy="27" r="2.8" fill="var(--color-heritage-accent)" />
      <circle cx="46" cy="27" r="2.8" fill="var(--color-heritage-accent)" />
      <circle cx="30" cy="22.5" r="2" fill="var(--color-heritage-line)" />
      <circle cx="42" cy="22.5" r="2" fill="var(--color-heritage-line)" />
      <path d="M27 50 h18" stroke="var(--color-heritage-accent)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
