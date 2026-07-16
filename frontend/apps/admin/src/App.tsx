import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@giapha/ui";
import { PersonFormPage } from "./persons/PersonFormPage";
import { PersonsListPage } from "./persons/PersonsListPage";

const navStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-sm)",
};

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? "var(--color-action-primary-bg)" : "var(--color-text-primary)",
  textDecoration: "none",
  fontFamily: "var(--font-body)",
  fontWeight: isActive ? 600 : 400,
  padding: "var(--spacing-xs) 0",
});

function Sidebar() {
  const items = [
    ["/", "Tổng quan"],
    ["/persons", "Thành viên"],
    ["/posts", "Bài viết"],
    ["/media", "Thư viện"],
    ["/settings", "Cài đặt"],
  ] as const;

  return (
    <nav style={navStyle} aria-label="Menu quản trị">
      {items.map(([path, label]) => (
        <NavLink key={path} to={path} end={path === "/"} style={linkStyle}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
      <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
        Khung menu R1.8 — màn này bổ sung ở phase sau.
      </p>
    </div>
  );
}

export function App() {
  return (
    <AppShell
      header={
        <header
          style={{
            padding: "var(--spacing-md) var(--spacing-lg)",
            borderBottom: "1px solid var(--color-border-subtle)",
            fontFamily: "var(--font-display)",
            background: "var(--color-surface-card)",
          }}
        >
          GiaPhaHub Admin · CRM
        </header>
      }
      sidebar={<Sidebar />}
    >
      <Routes>
        <Route path="/" element={<Placeholder title="Bảng điều khiển" />} />
        <Route path="/persons" element={<PersonsListPage />} />
        <Route path="/persons/new" element={<PersonFormPage />} />
        <Route path="/persons/:id" element={<PersonFormPage />} />
        <Route path="/posts" element={<Placeholder title="Bài viết" />} />
        <Route path="/media" element={<Placeholder title="Thư viện media" />} />
        <Route path="/settings" element={<Placeholder title="Cài đặt" />} />
        <Route path="*" element={<Navigate to="/persons" replace />} />
      </Routes>
    </AppShell>
  );
}
