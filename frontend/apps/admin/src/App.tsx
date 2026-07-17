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
import { adminSiteTitle } from "./lib/siteTitle";

const NAV_GROUPS = [
  {
    label: "Tổng quan",
    items: [
      { path: "/", label: "Bảng điều khiển", end: true },
    ],
  },
  {
    label: "Gia phả",
    items: [
      { path: "/persons", label: "Thành viên" },
      { path: "/tree", label: "Phả đồ" },
      { path: "/moderation", label: "Duyệt tự khai" },
    ],
  },
  {
    label: "Tộc sự",
    items: [
      { path: "/donation", label: "Quỹ công đức" },
      { path: "/events", label: "Sự kiện" },
      { path: "/notifications", label: "Nhắc giỗ" },
      { path: "/scholarship", label: "Khuyến học" },
    ],
  },
  {
    label: "Nội dung",
    items: [
      { path: "/posts", label: "Bài viết" },
      { path: "/comments", label: "Bình luận" },
      { path: "/media", label: "Thư viện" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { path: "/system", label: "Module" },
      { path: "/settings", label: "Cài đặt" },
    ],
  },
] as const;

const groupLabel: React.CSSProperties = {
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  color: "var(--color-heritage-deep)",
  fontFamily: "var(--font-body)",
  padding: "14px 12px 5px",
  display: "block",
};

function Sidebar() {
  return (
    <nav aria-label="Menu quản trị" style={{ display: "flex", flexDirection: "column" }}>
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <span style={groupLabel}>{group.label}</span>
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={"end" in item ? item.end : undefined}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                padding: "9px 12px",
                fontSize: 13.5,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--color-action-primary-bg)" : "var(--color-text-muted)",
                background: isActive
                  ? "color-mix(in srgb, var(--color-action-primary-bg) 8%, transparent)"
                  : "transparent",
                borderLeft: `2px solid ${isActive ? "var(--color-action-primary-bg)" : "transparent"}`,
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                transition: "all 0.13s",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function AdminHeader() {
  const { user, logout } = useAuth();
  const name = user?.profile?.preferred_username ?? user?.profile?.name ?? "";

  return (
    <div>
      <header
        style={{
          padding: "12px var(--spacing-lg)",
          fontFamily: "var(--font-display)",
          background: "var(--color-heritage-frame)",
          color: "var(--color-text-on-brand)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--spacing-md)",
        }}
      >
        <span style={{ fontWeight: 700, letterSpacing: "0.04em", fontSize: 15 }}>
          {adminSiteTitle()} · Quản trị
        </span>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", fontFamily: "var(--font-body)", fontSize: 13 }}>
            <span style={{ color: "var(--color-heritage-soft)" }}>{name}</span>
            <Button type="button" variant="ghost" onClick={() => void logout()} style={{ color: "var(--color-heritage-soft)", fontSize: 13 }}>
              Đăng xuất
            </Button>
          </div>
        ) : null}
      </header>
      <div
        aria-hidden
        style={{
          height: 12,
          background: `var(--color-heritage-frame) var(--pattern-meander) center / auto 10px repeat-x`,
          borderTop: "1px solid var(--color-heritage-line)",
          borderBottom: "1px solid var(--color-heritage-line)",
        }}
      />
    </div>
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
