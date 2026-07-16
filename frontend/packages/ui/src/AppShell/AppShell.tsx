import type { CSSProperties, ReactNode } from "react";

export interface AppShellProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
}

export function AppShell({ header, sidebar, children }: AppShellProps) {
  const root: CSSProperties = {
    minHeight: "100vh",
    display: "grid",
    gridTemplateRows: "auto 1fr",
    background: "var(--color-surface-page)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
  };

  const body: CSSProperties = {
    display: "grid",
    gridTemplateColumns: sidebar ? "240px 1fr" : "1fr",
  };

  const main: CSSProperties = {
    padding: "var(--spacing-lg)",
  };

  const aside: CSSProperties = {
    padding: "var(--spacing-md)",
    borderRight: "1px solid var(--color-border-subtle)",
    background: "var(--color-surface-card)",
  };

  return (
    <div style={root}>
      {header}
      <div style={body}>
        {sidebar ? <aside style={aside}>{sidebar}</aside> : null}
        <main style={main}>{children}</main>
      </div>
    </div>
  );
}
