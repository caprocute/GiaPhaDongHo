import { useEffect } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import { AppShell, Button } from "@giapha/ui";
import { AuthCallbackPage } from "./auth/AuthCallbackPage";
import { RequireAuth } from "./auth/RequireAuth";
import { persistOidcHints } from "./auth/oidcConfig";
import { PersonFormPage } from "./persons/PersonFormPage";
import { PersonsListPage } from "./persons/PersonsListPage";
import { CommentsModerationPage } from "./comments/CommentsModerationPage";
import { MediaLibraryPage } from "./media/MediaLibraryPage";
import { PostFormPage } from "./posts/PostFormPage";
import { PostsListPage } from "./posts/PostsListPage";
import { DashboardPage } from "./dashboard/DashboardPage";
import { DonationAdminPage } from "./donation/DonationAdminPage";
import { EventsAdminPage } from "./events/EventsAdminPage";
import { ModerationInboxPage } from "./moderation/ModerationInboxPage";
import { NotifyOutboxPage } from "./notifications/NotifyOutboxPage";
import { ScholarshipAdminPage } from "./scholarship/ScholarshipAdminPage";
import { SettingsPage } from "./settings/SettingsPage";
import { SystemModulesPage } from "./system/SystemModulesPage";
import { TreeEditorPage } from "./tree/TreeEditorPage";

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
    ["/tree", "Tree editor"],
    ["/moderation", "Duyệt tự khai"],
    ["/donation", "Quỹ công đức"],
    ["/events", "Sự kiện"],
    ["/notifications", "Nhắc giỗ"],
    ["/scholarship", "Khuyến học"],
    ["/system", "Hệ thống"],
    ["/posts", "Bài viết"],
    ["/comments", "Bình luận"],
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

function AdminHeader() {
  const { user, logout } = useAuth();
  const name = user?.profile?.preferred_username ?? user?.profile?.name ?? "";

  return (
    <header
      style={{
        padding: "var(--spacing-md) var(--spacing-lg)",
        borderBottom: "1px solid var(--color-border-subtle)",
        fontFamily: "var(--font-display)",
        background: "var(--color-surface-card)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "var(--spacing-md)",
      }}
    >
      <span>GiaPhaHub Admin · CRM</span>
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", fontFamily: "var(--font-body)", fontSize: "var(--font-size-sm)" }}>
          <span style={{ color: "var(--color-text-muted)" }}>{name}</span>
          <Button type="button" variant="ghost" onClick={() => void logout()}>
            Đăng xuất
          </Button>
        </div>
      ) : null}
    </header>
  );
}

function CrmRoutes() {
  return (
    <AppShell header={<AdminHeader />} sidebar={<Sidebar />}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/persons" element={<PersonsListPage />} />
        <Route path="/persons/new" element={<PersonFormPage />} />
        <Route path="/persons/:id" element={<PersonFormPage />} />
        <Route path="/tree" element={<TreeEditorPage />} />
        <Route path="/moderation" element={<ModerationInboxPage />} />
        <Route path="/donation" element={<DonationAdminPage />} />
        <Route path="/events" element={<EventsAdminPage />} />
        <Route path="/notifications" element={<NotifyOutboxPage />} />
        <Route path="/scholarship" element={<ScholarshipAdminPage />} />
        <Route path="/system" element={<SystemModulesPage />} />
        <Route path="/posts" element={<PostsListPage />} />
        <Route path="/posts/new" element={<PostFormPage />} />
        <Route path="/posts/:id" element={<PostFormPage />} />
        <Route path="/comments" element={<CommentsModerationPage />} />
        <Route path="/media" element={<MediaLibraryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/persons" replace />} />
      </Routes>
    </AppShell>
  );
}

export function App() {
  useEffect(() => {
    persistOidcHints();
  }, []);

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <CrmRoutes />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
