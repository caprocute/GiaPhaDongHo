import { useEffect, useMemo, useState, type ComponentType, type SVGProps } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import {
  AppShell,
  ClanSeal,
  PublicHeader,
  type PublicNavItem,
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
  Home,
  Images,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
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
      { path: "/posts", label: "Chương sách", icon: BookOpen },
      { path: "/notifications", label: "Ngày giỗ", icon: Flame },
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

function Sidebar({ pendingCount }: { pendingCount: number | null }) {
  return (
    <nav aria-label="Menu quản trị" style={{ display: "flex", flexDirection: "column" }}>
      <div className="crm-org">
        <ClanSeal compact className="crm-org-seal" />
        <div>
          <b>{adminSiteTitle()}</b>
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
  const location = useLocation();
  const portal = portalBase();

  const navItems: PublicNavItem[] = useMemo(
    () => [
      { href: `${portal}/`, label: "Trang chủ", icon: Home },
      { href: `${portal}/tree`, label: "Phả đồ", icon: GitBranch },
      { href: `${portal}/persons`, label: "Hồ sơ", icon: Users },
      {
        href: "/",
        label: "CRM quản trị",
        icon: LayoutDashboard,
        forceActive: true,
      },
    ],
    [portal],
  );

  const displayName = String(user?.profile?.name ?? user?.profile?.preferred_username ?? "Quản trị");

  return (
    <PublicHeader
      brand={adminSiteTitle()}
      subtitle="Bàn quản trị tộc sự · GiaPhaHub"
      brandHref="/"
      activeHref={location.pathname}
      fluid
      sticky={false}
      navItems={navItems}
      cta={{ href: portal, label: "Về cổng thông tin" }}
      utilityLeft={
        <>
          <b>GiaPhaHub</b>
          <span aria-hidden>·</span>
          <span>Di sản sống × hoa văn Việt phục</span>
        </>
      }
      utilityRight={<span style={{ opacity: 0.95 }}>{displayName}</span>}
      endSlot={
        user ? (
          <button
            type="button"
            onClick={() => void logout()}
            style={{
              font: "inherit",
              border: "1px solid color-mix(in srgb, var(--color-heritage-line) 70%, transparent)",
              background: "transparent",
              color: "var(--color-text-on-brand)",
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
              letterSpacing: "0.04em",
            }}
          >
            Đăng xuất
          </button>
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
