import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from "react";

export interface SideNavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: ReactNode;
  active?: boolean;
  badge?: ReactNode;
  children: ReactNode;
}

export function SideNavItem({ icon, active = false, badge, children, ...props }: SideNavItemProps) {
  const item: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 12px",
    fontSize: 13.5,
    fontWeight: active ? 700 : 500,
    color: active ? "var(--color-action-primary-bg)" : "var(--color-text-muted)",
    background: active ? "color-mix(in srgb, var(--color-action-primary-bg) 8%, transparent)" : "transparent",
    borderLeft: `2px solid ${active ? "var(--color-action-primary-bg)" : "transparent"}`,
    textDecoration: "none",
    transition: "all 0.13s",
    cursor: "pointer",
  };
  const ic: CSSProperties = {
    width: 18,
    height: 18,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "none",
    color: "currentColor",
    opacity: 0.92,
  };
  const bdg: CSSProperties = {
    marginLeft: "auto",
    fontSize: 10.5,
    fontWeight: 700,
    background: "var(--gradient-foil)",
    color: "var(--color-heritage-frame)",
    borderRadius: 999,
    padding: "1px 8px",
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <a style={item} {...props}>
      {icon && <span style={ic}>{icon}</span>}
      {children}
      {badge && <span style={bdg}>{badge}</span>}
    </a>
  );
}
