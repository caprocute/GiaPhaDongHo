import type { SelectHTMLAttributes, CSSProperties } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ options, style, children, ...props }: SelectProps) {
  const base: CSSProperties = {
    width: "100%",
    minHeight: "44px",
    padding: "var(--spacing-sm) var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--color-border-subtle)",
    background: "var(--color-surface-card)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-md)",
    ...style,
  };

  return (
    <select style={base} {...props}>
      {children}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
