import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import {
  AppShell,
  ClanSeal,
  PublicFooter,
  PublicHeader,
} from "@giapha/ui";
import {
  BookOpen,
  Boxes,
  CalendarDays,
  ClipboardCheck,
  Flame,
  GitBranch,
  GraduationCap,
  HandCoins,
  Images,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import { AuthCallbackPage } from "./auth/AuthCallbackPage";
import { AdminLoginPage } from "./auth/AdminLoginPage";
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

type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>;

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  badgeKey?: "pending";
};

type NavGroup = { label?: string; items: NavItem[] };

const SIDE_NAV: NavGroup[] = [
  {
    items: [{ path: "/", label: "Bảng điều khiển", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Gia phả",
    items: [
      { path: "/tree", label: "Cây phả hệ", icon: GitBranch },
      { path: "/persons", label: "Thành viên", icon: Users },
      { path: "/posts", label: "Bài viết", icon: BookOpen },
      { path: "/notifications", label: "Nhắc giỗ", icon: Flame },
    ],
  },
  {
    label: "Tộc sự",
    items: [
      { path: "/moderation", label: "Chờ duyệt", icon: ClipboardCheck, badgeKey: "pending" },
      { path: "/donation", label: "Quỹ công đức", icon: HandCoins },
      { path: "/events", label: "Sự kiện", icon: CalendarDays },
      { path: "/scholarship", label: "Khuyến học", icon: GraduationCap },
    ],
  },
  {
    label: "Nội dung",
    items: [
      { path: "/comments", label: "Bình luận", icon: MessageSquare },
      { path: "/media", label: "Thư viện", icon: Images },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { path: "/system", label: "Module & nhật ký", icon: Boxes },
      { path: "/settings", label: "Cấu hình", icon: Settings },
    ],
  },
];

function portalBase(): string {
  return import.meta.env.VITE_PORTAL_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

function useLiveSiteTitle(): string {
  const [title, setTitle] = useState(() => adminSiteTitle());
  useEffect(() => {
    const sync = () => setTitle(adminSiteTitle());
    window.addEventListener("giapha-site-title", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("giapha-site-title", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return title;
}

function Sidebar({ pendingCount }: { pendingCount: number | null }) {
  const siteTitle = useLiveSiteTitle();
  return (
    <nav aria-label="Menu quản trị" style={{ display: "flex", flexDirection: "column" }}>
      <div className="crm-org">
        <ClanSeal compact className="crm-org-seal" />
        <div>
          <b>{siteTitle}</b>
          <small>Bàn quản trị tộc sự</small>
        </div>
      </div>
      {SIDE_NAV.map((group, gi) => (
        <div key={group.label ?? `g-${gi}`}>
          {group.label ? <span className="crm-nav-group">{group.label}</span> : null}
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? "crm-nav-link crm-nav-link-on" : "crm-nav-link"
                }
              >
                <span className="crm-nav-ic" aria-hidden>
                  <Icon size={16} strokeWidth={2.25} />
                </span>
                {item.label}
                {item.badgeKey === "pending" && pendingCount != null && pendingCount > 0 ? (
                  <span className="crm-nav-badge">{pendingCount}</span>
                ) : null}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const portal = portalBase();
  const siteTitle = useLiveSiteTitle();
  const displayName = String(user?.profile?.name ?? user?.profile?.preferred_username ?? "Quản trị");

  return (
    <PublicHeader
      brand={siteTitle}
      brandHref="/"
      fluid
      sticky={false}
      navItems={[]}
      cta={{ href: portal, label: "Về cổng thông tin" }}
      endSlot={
        user ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
            <span style={{ opacity: 0.9 }}>{displayName}</span>
            <button
              type="button"
              onClick={() => {
                void logout().then(() => navigate("/login", { replace: true }));
              }}
              style={{
                font: "inherit",
                border: 0,
                background: "transparent",
                color: "var(--color-heritage-soft)",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Đăng xuất
            </button>
          </span>
        ) : null
      }
    />
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
    <AppShell
      header={<AdminHeader />}
      sidebar={<Sidebar pendingCount={pendingCount} />}
      footer={<PublicFooter />}
    >
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
      <Route path="/login" element={<AdminLoginPage />} />
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
