import type { CSSProperties } from "react";

export function PublicFooter() {
  const style: CSSProperties = {
    marginTop: "auto",
    padding: "var(--spacing-lg)",
    background: "var(--color-surface-card)",
    borderTop: "1px solid var(--color-border-subtle)",
    color: "var(--color-text-muted)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-sm)",
    textAlign: "center",
  };

  return (
    <footer style={style}>
      <p>© {new Date().getFullYear()} GiaPhaHub — Di sản sống</p>
    </footer>
  );
}
