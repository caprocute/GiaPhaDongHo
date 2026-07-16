import type { InputHTMLAttributes, CSSProperties } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

export function Checkbox({ label, style, ...props }: CheckboxProps) {
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

  const box: CSSProperties = {
    width: "20px",
    height: "20px",
    accentColor: "var(--color-action-primary-bg)",
  };

  return (
    <label style={wrap}>
      <input type="checkbox" style={box} {...props} />
      <span>{label}</span>
    </label>
  );
}
