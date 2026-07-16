import type { ButtonHTMLAttributes, CSSProperties } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "var(--color-action-primary-bg)",
    color: "var(--color-action-primary-fg)",
    border: "none",
  },
  secondary: {
    background: "var(--color-surface-card)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-default)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-primary)",
    border: "none",
  },
};

export function Button({ variant = "primary", style, children, ...props }: ButtonProps) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--spacing-sm)",
    minHeight: "44px",
    padding: "var(--spacing-sm) var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-md)",
    cursor: "pointer",
    transition: "opacity var(--motion-duration-fast)",
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button type="button" style={base} {...props}>
      {children}
    </button>
  );
}
