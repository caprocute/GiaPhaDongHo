import type { TextareaHTMLAttributes, CSSProperties } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, style, ...props }: TextareaProps) {
  const base: CSSProperties = {
    boxSizing: "border-box",
    display: "block",
    width: "100%",
    minHeight: "120px",
    margin: 0,
    padding: "var(--spacing-sm) var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    border: invalid
      ? "1px solid var(--color-status-error-fg)"
      : "1px solid var(--color-border-subtle)",
    background: "var(--color-surface-card)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-md)",
    lineHeight: 1.45,
    resize: "vertical",
    ...style,
  };

  return <textarea style={base} {...props} />;
}
