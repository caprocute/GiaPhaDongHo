import type { InputHTMLAttributes, CSSProperties } from "react";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function Switch({ label, checked, style, ...props }: SwitchProps) {
  const wrap: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--spacing-sm)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-md)",
    cursor: "pointer",
    ...style,
  };

  const track: CSSProperties = {
    width: "44px",
    height: "24px",
    borderRadius: "999px",
    background: checked ? "var(--color-action-primary-bg)" : "var(--color-border-subtle)",
    position: "relative",
    transition: `background var(--motion-duration-fast)`,
  };

  const thumb: CSSProperties = {
    position: "absolute",
    top: "2px",
    left: checked ? "22px" : "2px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "var(--color-surface-card)",
    transition: `left var(--motion-duration-fast)`,
  };

  return (
    <label style={wrap}>
      <input type="checkbox" role="switch" checked={checked} style={{ display: "none" }} {...props} />
      <span style={track} aria-hidden="true">
        <span style={thumb} />
      </span>
      <span>{label}</span>
    </label>
  );
}
