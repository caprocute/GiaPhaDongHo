import type { InputHTMLAttributes, CSSProperties } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, style, ...props }: InputProps) {
  const base: CSSProperties = {
    width: "100%",
    minHeight: "44px",
    padding: "var(--spacing-sm) var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    border: invalid
      ? "1px solid var(--color-status-error-fg)"
      : "1px solid var(--color-border-subtle)",
    background: "var(--color-surface-card)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-md)",
    ...style,
  };

  return <input style={base} {...props} />;
}
