"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import styles from "./PublicHeader.module.css";

export interface PublicHeaderProps {
  brand?: string;
  subtitle?: string;
  /** Slot bên phải hàng brand (VD: AuthNav) */
  endSlot?: ReactNode;
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
  { href: "/su-kien", label: "Sự kiện" },
  { href: "/nhac-gio", label: "Nhắc giỗ" },
  { href: "/xung-ho", label: "Xưng hô" },
  { href: "/khuyen-hoc", label: "Khuyến học" },
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
      {/* Utility bar */}
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

      {/* Meander band */}
      <div className={styles.band} aria-hidden="true" />

      <header className={styles.masthead}>
        {/* Hàng 1: brand (trái) + CTA + auth (phải) */}
        <div className={`${styles.wrap} ${styles.brandRow}`}>
          <a href="/" className={styles.brandLink} aria-label={brand}>
            <Seal />
            <div className={styles.brand}>
              <h1>{brand}</h1>
              <div className={styles.sub}>{subtitle}</div>
            </div>
          </a>

          <div className={styles.brandEnd}>
            <a href="/tree" className={styles.cta}>Tra cứu phả đồ</a>
          </div>

          {/* Hamburger — chỉ hiện mobile */}
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

        {/* Hàng 2: tất cả menu chức năng — chỉ desktop */}
        <div className={styles.navRow} aria-hidden="false">
          <div className={styles.wrap}>
            <nav className={styles.navStrip} aria-label="Menu chính">
              {NAV.map((item) => {
                const cur =
                  item.href === "/"
                    ? activeHref === "/"
                    : activeHref === item.href || activeHref.startsWith(`${item.href}/`);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cur ? `${styles.navItem} ${styles.navItemCur}` : styles.navItem}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          id={panelId}
          className={open ? `${styles.drawer} ${styles.drawerOpen}` : styles.drawer}
          hidden={!open}
        >
          <nav className={styles.drawerNav} aria-label="Menu di động">
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
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              );
            })}
            <a href="/tree" className={`${styles.cta} ${styles.drawerCta}`} onClick={() => setOpen(false)}>
              Tra cứu phả đồ
            </a>
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
