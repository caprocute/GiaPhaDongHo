import type { CSSProperties, ReactNode } from "react";

export interface PanelProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, action, children }: PanelProps) {
  const card: CSSProperties = {
    background: "var(--color-surface-card)",
    border: "1px solid var(--color-border-strong)",
    boxShadow: "var(--shadow-sm)",
  };
  const head: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    borderBottom: "1px solid var(--color-border-strong)",
    background: "color-mix(in srgb, var(--color-heritage-accent) 6%, transparent)",
  };
  const headTitle: CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  };
  const headAction: CSSProperties = {
    marginLeft: "auto",
    fontSize: 12,
    color: "var(--color-action-primary-bg)",
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <div style={card}>
      <div style={head}>
        <span style={headTitle}>{title}</span>
        {action && <span style={headAction}>{action}</span>}
      </div>
      {children}
    </div>
  );
}
