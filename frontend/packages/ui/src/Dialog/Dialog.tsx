"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "../Button/Button";
import styles from "./Dialog.module.css";

export type DialogVariant = "default" | "ceremonial";
export type DialogSize = "md" | "lg";

export interface DialogProps {
  open: boolean;
  title: string;
  /** Dòng phụ dưới tiêu đề */
  description?: string;
  /** Nhãn nhỏ phía trên tiêu đề (biến thể ceremonial) */
  eyebrow?: string;
  children?: ReactNode;
  /** Nút / hành động đáy — thay nút Đóng mặc định khi truyền */
  footer?: ReactNode;
  onClose: () => void;
  variant?: DialogVariant;
  size?: DialogSize;
  /** Cho phép đóng khi bấm nền (mặc định true) */
  closeOnOverlay?: boolean;
}

export function Dialog({
  open,
  title,
  description,
  eyebrow,
  children,
  footer,
  onClose,
  variant = "default",
  size = "md",
  closeOnOverlay = true,
}: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const t = window.setTimeout(() => {
      const root = panelRef.current;
      if (!root) return;
      const first = root.querySelector<HTMLElement>(
        "input, textarea, select, button:not([aria-label='Đóng']), [href]",
      );
      first?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isCeremonial = variant === "ceremonial";
  const panelClass = [
    styles.panel,
    size === "lg" ? styles.panelLg : "",
    isCeremonial ? styles.ceremonial : "",
  ]
    .filter(Boolean)
    .join(" ");

  const head = (
    <>
      {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {description ? (
        <p id={descId} className={styles.description}>
          {description}
        </p>
      ) : null}
    </>
  );

  const body = children ? <div className={styles.body}>{children}</div> : null;

  const foot =
    footer !== null ? (
      <div className={`${styles.footer} ${isCeremonial ? "" : styles.footerDefault}`}>
        {footer !== undefined ? (
          footer
        ) : (
          <Button type="button" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        )}
      </div>
    ) : null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(e) => {
        if (!closeOnOverlay) return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={panelClass}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Đóng">
          ×
        </button>
        {isCeremonial ? (
          <div className={styles.ceremonialFrame}>
            <div className={styles.ceremonialMain}>
              {head}
              {body}
            </div>
            {foot}
          </div>
        ) : (
          <>
            {head}
            {body}
            {foot}
          </>
        )}
      </div>
    </div>
  );
}
