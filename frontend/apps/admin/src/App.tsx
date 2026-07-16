import { AppShell } from "@giapha/ui";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

const navStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "var(--spacing-sm)",
};

const linkStyle = {
  color: "var(--color-text-primary)",
  textDecoration: "none",
  fontFamily: "var(--font-body)",
};

function Sidebar() {
  const items = [
    ["persons", "Thành viên"],
    ["posts", "Bài viết"],
    ["media", "Thư viện"],
    ["settings", "Cài đặt"],
    ["change-requests", "Yêu cầu sửa"],
    ["donations", "Công đức"],
    ["events", "Sự kiện"],
  ] as const;

  return (
    <nav style={navStyle} aria-label="Admin menu">
      {items.map(([path, label]) => (
        <Link key={path} to={`/${path}`} style={linkStyle}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Page({ title }: { title: string }) {
  return <h1 style={{ fontFamily: "var(--font-display)" }}>{title}</h1>;
}

export function App() {
  return (
    <BrowserRouter>
      <AppShell
        header={
          <header style={{ padding: "var(--spacing-md)", borderBottom: "1px solid var(--color-border-subtle)" }}>
            GiaPhaHub Admin
          </header>
        }
        sidebar={<Sidebar />}
      >
        <Routes>
          <Route path="/" element={<Page title="Bảng điều khiển" />} />
          <Route path="/persons" element={<Page title="Quản lý thành viên" />} />
          <Route path="/posts" element={<Page title="Quản lý bài viết" />} />
          <Route path="/media" element={<Page title="Thư viện media" />} />
          <Route path="/settings" element={<Page title="Cài đặt" />} />
          <Route path="/change-requests" element={<Page title="Yêu cầu thay đổi" />} />
          <Route path="/donations" element={<Page title="Công đức" />} />
          <Route path="/events" element={<Page title="Sự kiện" />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
