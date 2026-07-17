"use client";

import { useEffect, useId, useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import {
  BookOpen,
  CalendarDays,
  FilePenLine,
  Flame,
  GitBranch,
  GraduationCap,
  HandCoins,
  Home,
  Images,
  Languages,
  LayoutDashboard,
  Newspaper,
  Phone,
  Search,
  Users,
} from "lucide-react";
import { ClanSeal } from "../ClanSeal/ClanSeal";
import { LunarUtilityLabel } from "./LunarUtilityLabel";
import styles from "./PublicHeader.module.css";

export type PublicHeaderIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

export type PublicNavItem = {
  href: string;
  label: string;
  icon?: PublicHeaderIcon;
  /** Ép trạng thái active (VD: tab CRM luôn sáng trên admin) */
  forceActive?: boolean;
};

export interface PublicHeaderProps {
  brand?: string;
  subtitle?: string;
  brandHref?: string;
  /** Slot bên phải utility (VD: AuthNav) */
  endSlot?: ReactNode;
  activeHref?: string;
  utilityLeft?: ReactNode;
  /** Mặc định: ngày dương/âm. Truyền `null` để ẩn. */
  utilityRight?: ReactNode | null;
  /** Menu hàng 2 — mặc định menu portal; `[]` ẩn hàng tab (admin) */
  navItems?: PublicNavItem[];
  /** CTA brand row; `null` để ẩn */
  cta?: { href: string; label: string } | null;
  /** Bỏ max-width 1280 (admin full-bleed) */
  fluid?: boolean;
  /** Không sticky (khi nằm trong AppShell header cố định) */
  sticky?: boolean;
}

const PORTAL_NAV: PublicNavItem[] = [
  { href: "/", label: "Trang nhất", icon: Home },
  { href: "/persons", label: "Dòng họ", icon: Users },
  { href: "/tree", label: "Gia phả", icon: GitBranch },
  { href: "/tu-khai", label: "Tự khai", icon: FilePenLine },
  { href: "/cong-duc", label: "Công đức", icon: HandCoins },
  { href: "/su-kien", label: "Sự kiện", icon: CalendarDays },
  { href: "/nhac-gio", label: "Nhắc giỗ", icon: Flame },
  { href: "/xung-ho", label: "Xưng hô", icon: Languages },
  { href: "/khuyen-hoc", label: "Khuyến học", icon: GraduationCap },
  { href: "/news", label: "Tin tức", icon: Newspaper },
  { href: "/album", label: "Thư viện", icon: Images },
];

export const ADMIN_SURFACE_NAV_ICONS = {
  home: Home,
  tree: GitBranch,
  persons: Users,
  crm: LayoutDashboard,
  search: Search,
  book: BookOpen,
  phone: Phone,
} as const;

function isNavActive(item: PublicNavItem, activeHref: string): boolean {
  if (item.forceActive) return true;
  if (item.href.startsWith("http://") || item.href.startsWith("https://")) {
    return false;
  }
  if (item.href === "/") {
    return activeHref === "/";
  }
  return activeHref === item.href || activeHref.startsWith(`${item.href}/`);
}

export function PublicHeader({
  brand = "Họ Hoàng – Huỳnh",
  subtitle = "Thôn Trung Bính · Bảo Ninh · Đồng Hới",
  brandHref = "/",
  endSlot,
  activeHref = "/",
  utilityLeft,
  utilityRight,
  navItems = PORTAL_NAV,
  cta = { href: "/tree", label: "Tra cứu phả đồ" },
  fluid = false,
  sticky = true,
}: PublicHeaderProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapClass = fluid ? `${styles.wrap} ${styles.wrapFluid}` : styles.wrap;
  const showNav = navItems.length > 0;
  const rightSlot = utilityRight === undefined ? <LunarUtilityLabel /> : utilityRight;

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
    <div className={sticky ? styles.root : `${styles.root} ${styles.rootStatic}`}>
      <div className={styles.utility}>
        <div className={wrapClass}>
          <span className={styles.utilityLeft}>
            {utilityLeft ?? (
              <>
                <Phone size={13} strokeWidth={2.25} aria-hidden className={styles.utilityIcon} />
                0970 307 9059 · <b>hohoang@giapha.vn</b>
              </>
            )}
          </span>
          <span className={styles.utilityRight}>
            {rightSlot}
            {endSlot}
          </span>
        </div>
      </div>

      <div className={styles.band} aria-hidden="true" />

      <header className={styles.masthead}>
        <div className={`${wrapClass} ${styles.brandRow}`}>
          <a href={brandHref} className={styles.brandLink} aria-label={brand}>
            <ClanSeal className={styles.seal} />
            <div className={styles.brand}>
              <h1>{brand}</h1>
              <div className={styles.sub}>{subtitle}</div>
            </div>
          </a>

          {cta ? (
            <div className={styles.brandEnd}>
              <a href={cta.href} className={styles.cta}>
                {cta.label}
              </a>
            </div>
          ) : null}

          {showNav ? (
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
          ) : null}
        </div>

        {showNav ? (
          <div className={styles.navRow}>
            <div className={wrapClass}>
              <nav className={styles.navStrip} aria-label="Menu chính">
                {navItems.map((item) => {
                  const cur = isNavActive(item, activeHref);
                  const Icon = item.icon;
                  return (
                    <a
                      key={`${item.href}-${item.label}`}
                      href={item.href}
                      className={cur ? `${styles.navItem} ${styles.navItemCur}` : styles.navItem}
                    >
                      {Icon ? <Icon className={styles.navIcon} size={14} strokeWidth={2.25} aria-hidden /> : null}
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>
        ) : null}

        {showNav ? (
          <div
            id={panelId}
            className={open ? `${styles.drawer} ${styles.drawerOpen}` : styles.drawer}
            hidden={!open}
          >
            <nav className={styles.drawerNav} aria-label="Menu di động">
              {navItems.map((item) => {
                const cur = isNavActive(item, activeHref);
                const Icon = item.icon;
                return (
                  <a
                    key={`d-${item.href}-${item.label}`}
                    href={item.href}
                    className={cur ? styles.cur : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {Icon ? <Icon className={styles.navIcon} size={16} strokeWidth={2.25} aria-hidden /> : null}
                    {item.label}
                  </a>
                );
              })}
              {cta ? (
                <a href={cta.href} className={`${styles.cta} ${styles.drawerCta}`} onClick={() => setOpen(false)}>
                  {cta.label}
                </a>
              ) : null}
            </nav>
          </div>
        ) : null}
      </header>

      {showNav && open ? (
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
