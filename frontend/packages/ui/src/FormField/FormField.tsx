import type { ReactNode, CSSProperties } from "react";
import { mutedText } from "../styles/common";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, htmlFor, hint, error, required, children }: FormFieldProps) {
  const labelStyle: CSSProperties = {
    display: "block",
    marginBottom: "var(--spacing-xs)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
  };

  return (
    <div style={{ marginBottom: "var(--spacing-md)" }}>
      <label htmlFor={htmlFor} style={labelStyle}>
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {hint && !error ? <p style={{ ...mutedText, marginTop: "var(--spacing-xs)" }}>{hint}</p> : null}
      {error ? (
        <p style={{ ...mutedText, marginTop: "var(--spacing-xs)", color: "var(--color-status-error-fg)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
