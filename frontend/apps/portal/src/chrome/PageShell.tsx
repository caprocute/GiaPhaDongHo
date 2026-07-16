import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./portal.module.css";

export type Crumb = { label: string; href?: string };

type Props = {
  label?: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  toolbarRight?: ReactNode;
  children: ReactNode;
  /** Bỏ padding body (vd. phả đồ full-bleed zone) */
  flush?: boolean;
  /** Chỉ band + toolbar + children (hồ sơ / layout riêng) */
  hideHeader?: boolean;
};

export function PageShell({
  label,
  title,
  lead,
  crumbs,
  toolbarRight,
  children,
  flush,
  hideHeader,
}: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.band} aria-hidden />
      {(crumbs?.length || toolbarRight) && (
        <div className={styles.toolbar}>
          <div className={`${styles.wrap} ${styles.toolbarInner}`}>
            {crumbs?.length ? (
              <nav className={styles.crumb} aria-label="Breadcrumb">
                {crumbs.map((c, i) => (
                  <span key={`${c.label}-${i}`}>
                    {i > 0 ? " / " : null}
                    {c.href ? (
                      <Link href={c.href}>{c.label}</Link>
                    ) : (
                      <b>{c.label}</b>
                    )}
                  </span>
                ))}
              </nav>
            ) : (
              <span />
            )}
            {toolbarRight ? <div className={styles.tools}>{toolbarRight}</div> : null}
          </div>
        </div>
      )}
      {flush || hideHeader ? (
        <div className={`${styles.wrap} ${flush ? styles.flushBody : styles.body}`}>
          {children}
        </div>
      ) : (
        <div className={`${styles.wrap} ${styles.body}`}>
          <header className={styles.secHead}>
            <div>
              {label ? <div className={styles.label}>{label}</div> : null}
              <h1 className={styles.title}>{title}</h1>
              {lead ? <p className={styles.lead}>{lead}</p> : null}
            </div>
            <span className={styles.rule} aria-hidden />
          </header>
          {children}
        </div>
      )}
    </div>
  );
}
