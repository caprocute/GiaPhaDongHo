import type { CSSProperties, ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const style: CSSProperties = {
    padding: "var(--spacing-xl)",
    textAlign: "center",
    background: "var(--color-surface-page)",
    border: "1px dashed var(--color-border-subtle)",
    borderRadius: "var(--radius-lg)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
  };

  return (
    <div style={style}>
      <h3 style={{ fontFamily: "var(--font-display)", marginBottom: "var(--spacing-sm)" }}>{title}</h3>
      {description ? (
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--spacing-md)" }}>{description}</p>
      ) : null}
      {action}
    </div>
  );
}
