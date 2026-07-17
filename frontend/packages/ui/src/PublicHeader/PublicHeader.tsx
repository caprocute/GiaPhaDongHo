"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import styles from "./PublicHeader.module.css";

export interface PublicHeaderProps {
  /** Tên dòng họ — hero brand trên masthead */
  brand?: string;
  subtitle?: string;
  /** Slot bên phải nav (VD: AuthNav) */
  endSlot?: ReactNode;
  /** Path hiện tại để highlight menu */
  activeHref?: string;
  utilityLeft?: ReactNode;
  utilityRight?: ReactNode;
}

const NAV = [
  { href: "/", label: "Trang nhất" },
  { href: "/persons", label: "Dòng họ" },
  { href: "/tree", label: "Gia phả" },
  { href: "/tu-khai", label: "Tự khai" },
  { href: "/cong-duc", label: "Công đức" },
  { href: "/news", label: "Tin tức" },
  { href: "/album", label: "Thư viện" },
] as const;

function Seal() {
  return (
    <svg className={styles.seal} viewBox="0 0 72 72" aria-hidden="true">
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

function NavLinks({
  activeHref,
  onNavigate,
  ctaClassName,
}: {
  activeHref: string;
  onNavigate?: () => void;
  ctaClassName: string;
}) {
  return (
    <>
      {NAV.map((item) => {
        const cur =
          item.href === "/"
            ? activeHref === "/"
            : activeHref === item.href || activeHref.startsWith(`${item.href}/`);
        return (
          <a
            key={item.href}
            href={item.href}
            className={cur ? styles.cur : undefined}
            onClick={onNavigate}
          >
            {item.label}
          </a>
        );
      })}
      <a href="/tree" className={ctaClassName} onClick={onNavigate}>
        Tra cứu phả đồ
      </a>
    </>
  );
}

export function PublicHeader({
  brand = "Họ Hoàng – Huỳnh",
  subtitle = "Thôn Trung Bính · Bảo Ninh · Đồng Hới",
  endSlot,
  activeHref = "/",
  utilityLeft,
  utilityRight,
}: PublicHeaderProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [activeHref]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className={styles.root}>
      <div className={styles.utility}>
        <div className={styles.wrap}>
          <span className={styles.utilityLeft}>
            {utilityLeft ?? (
              <>
                ☎ 0970 307 9059 · <b>hohoang@giapha.vn</b>
              </>
            )}
          </span>
          <span className={styles.utilityRight}>
            {utilityRight}
            {endSlot}
          </span>
        </div>
      </div>
      <div className={styles.band} aria-hidden="true" />
      <header className={styles.masthead}>
        <div className={styles.wrap}>
          <a href="/" className={styles.brandLink} aria-label={brand}>
            <Seal />
            <div className={styles.brand}>
              <h1>{brand}</h1>
              <div className={styles.sub}>{subtitle}</div>
            </div>
          </a>

          <nav className={styles.nav} aria-label="Menu chính">
            <NavLinks activeHref={activeHref} ctaClassName={styles.cta} />
          </nav>

          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={open ? styles.menuIconOpen : styles.menuIcon} aria-hidden />
          </button>
        </div>

        <div
          id={panelId}
          className={open ? `${styles.drawer} ${styles.drawerOpen}` : styles.drawer}
          hidden={!open}
        >
          <nav className={styles.drawerNav} aria-label="Menu di động">
            <NavLinks
              activeHref={activeHref}
              onNavigate={() => setOpen(false)}
              ctaClassName={`${styles.cta} ${styles.drawerCta}`}
            />
          </nav>
        </div>
      </header>

      {open ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Đóng menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
