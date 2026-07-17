import type { CSSProperties, ReactNode } from "react";

export interface AppShellProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function AppShell({ header, sidebar, footer, children }: AppShellProps) {
  const root: CSSProperties = {
    minHeight: "100vh",
    display: "grid",
    gridTemplateRows: footer ? "auto 1fr auto" : "auto 1fr",
    background: "var(--color-surface-sunken)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-body)",
  };

  return (
    <div style={root}>
      {header}
      <div className="app-shell-body">
        {sidebar ? <aside className="app-shell-aside">{sidebar}</aside> : null}
        <main className="app-shell-main">{children}</main>
      </div>
      {footer ? <div className="app-shell-footer">{footer}</div> : null}
      <style>{`
        .app-shell-body {
          display: grid;
          grid-template-columns: ${sidebar ? "236px 1fr" : "1fr"};
          min-height: 0;
          background: var(--color-surface-sunken);
        }
        .app-shell-aside {
          padding: 22px 14px;
          border-right: 1px solid var(--color-border-strong);
          background: var(--color-surface-card);
          overflow-y: auto;
        }
        .app-shell-main {
          padding: 26px 30px;
          overflow-y: auto;
          min-width: 0;
        }
        .app-shell-footer {
          min-width: 0;
        }
        @media (max-width: 960px) {
          .app-shell-body {
            grid-template-columns: 1fr;
          }
          .app-shell-aside {
            border-right: none;
            border-bottom: 1px solid var(--color-border-subtle);
            overflow-x: auto;
            overflow-y: visible;
            padding: 0;
          }
          .app-shell-aside nav {
            flex-direction: row !important;
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: 0;
          }
          .app-shell-aside nav > div {
            display: contents;
          }
          .app-shell-aside .crm-org,
          .app-shell-aside .crm-nav-group,
          .app-shell-aside .crm-nav-ic {
            display: none !important;
          }
          .app-shell-aside nav a {
            border-left: none !important;
            border-bottom: 2px solid transparent;
            padding: 12px 14px !important;
            white-space: nowrap;
            font-size: 12.5px !important;
          }
          .app-shell-main {
            padding: var(--spacing-md);
          }
        }
      `}</style>
    </div>
  );
}
