import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import { AppShell } from "@giapha/ui";
import { AuthCallbackPage } from "./auth/AuthCallbackPage";
import { RequireAuth } from "./auth/RequireAuth";
import { persistOidcHints } from "./auth/oidcConfig";
import { defaultTreeSlug, listChangeRequests } from "./api/genealogyApi";
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

type NavItem = {
  path: string;
  label: string;
  icon: string;
  end?: boolean;
  badgeKey?: "pending";
};

type NavGroup = { label?: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    items: [{ path: "/", label: "Bảng điều khiển", icon: "◫", end: true }],
  },
  {
    label: "Gia phả",
    items: [
      { path: "/tree", label: "Cây phả hệ", icon: "⌘" },
      { path: "/persons", label: "Thành viên", icon: "☰" },
      { path: "/posts", label: "Chương sách", icon: "✎" },
      { path: "/notifications", label: "Ngày giỗ", icon: "🕯" },
    ],
  },
  {
    label: "Tộc sự",
    items: [
      { path: "/moderation", label: "Chờ duyệt", icon: "✓", badgeKey: "pending" },
      { path: "/donation", label: "Quỹ công đức", icon: "🪙" },
      { path: "/events", label: "Sự kiện", icon: "🏮" },
      { path: "/scholarship", label: "Khuyến học", icon: "🎓" },
    ],
  },
  {
    label: "Nội dung",
    items: [
      { path: "/comments", label: "Bình luận", icon: "💬" },
      { path: "/media", label: "Thư viện", icon: "🖼" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { path: "/system", label: "Module & nhật ký", icon: "👥" },
      { path: "/settings", label: "Cấu hình", icon: "⚙" },
    ],
  },
];

function ClanSeal() {
  return (
    <svg className="crm-org-seal" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="33" fill="none" stroke="var(--color-heritage-accent)" strokeWidth="3" />
      <circle cx="36" cy="36" r="27" fill="var(--color-heritage-frame)" />
      <path
        d="M36 48 V29 M36 36 L27 27 M36 36 L45 27"
        stroke="var(--color-heritage-soft)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M28 48 h16" stroke="var(--color-heritage-accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Sidebar({ pendingCount }: { pendingCount: number | null }) {
  return (
    <nav aria-label="Menu quản trị" style={{ display: "flex", flexDirection: "column" }}>
      <div className="crm-org">
        <ClanSeal />
        <div>
          <b>{adminSiteTitle()}</b>
          <small>Bàn quản trị tộc sự</small>
        </div>
      </div>
      {NAV.map((group, gi) => (
        <div key={group.label ?? `g-${gi}`}>
          {group.label ? <span className="crm-nav-group">{group.label}</span> : null}
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                isActive ? `crm-nav-link crm-nav-link-on` : "crm-nav-link"
              }
            >
              <span className="crm-nav-ic" aria-hidden>
                {item.icon}
              </span>
              {item.label}
              {item.badgeKey === "pending" && pendingCount != null && pendingCount > 0 ? (
                <span className="crm-nav-badge">{pendingCount}</span>
              ) : null}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function AdminHeader() {
  const { user, logout } = useAuth();
  const portalUrl = import.meta.env.VITE_PORTAL_URL?.replace(/\/$/, "") || "http://localhost:3000";

  return (
    <div>
      <div className="crm-chrome">
        <div className="crm-chrome-in">
          <span>
            <b>GiaPhaHub</b> · Bản mẫu — «Di sản sống» × hoa văn Việt phục
          </span>
          <nav className="crm-chrome-tabs" aria-label="Chuyển bề mặt">
            <a className="crm-chrome-tab" href={`${portalUrl}/`}>
              Trang chủ
            </a>
            <a className="crm-chrome-tab" href={`${portalUrl}/tree`}>
              Phả đồ
            </a>
            <a className="crm-chrome-tab" href={`${portalUrl}/persons`}>
              Hồ sơ
            </a>
            <span className="crm-chrome-tab crm-chrome-tab-on">CRM quản trị</span>
            {user ? (
              <button type="button" className="crm-chrome-tab" onClick={() => void logout()}>
                Đăng xuất
              </button>
            ) : null}
          </nav>
        </div>
      </div>
      <div className="crm-band" aria-hidden />
    </div>
  );
}

function CrmRoutes() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const token = await getAccessToken();
        const page = await listChangeRequests(slug, "pending", token, 0, 1);
        setPendingCount(page.totalElements);
      } catch {
        setPendingCount(null);
      }
    })();
  }, [getAccessToken, slug]);

  return (
    <AppShell header={<AdminHeader />} sidebar={<Sidebar pendingCount={pendingCount} />}>
      <Routes>
        <Route path="/" element={<DashboardPage onPendingChange={setPendingCount} />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
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
