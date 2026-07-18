import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import { Alert, Button, Input, Select, Textarea } from "@giapha/ui";
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  Database,
  GitBranch,
  Hash,
  KeyRound,
  Link2,
  Mail,
  MessageCircle,
  Palette,
  Save,
  ScrollText,
  Shield,
  ShieldCheck,
  Upload,
  UserPlus,
} from "lucide-react";
import {
  defaultTreeSlug,
  getTreeSettings,
  setStoredTreeSlug,
  testTreeSmtp,
  updateTreeSettings,
  type TreeSettingsDto,
} from "../api/genealogyApi";
import { uploadMediaPhoto } from "../api/mediaApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { persistAdminSiteTitle } from "../lib/siteTitle";
import styles from "./settings.module.css";

type SectionId =
  | "identity"
  | "brand"
  | "tree"
  | "calendar"
  | "code"
  | "auth"
  | "privacy"
  | "roles"
  | "smtp"
  | "zalo"
  | "notify"
  | "backup"
  | "webhook"
  | "audit";

const NAV: { group: string; items: { id: SectionId; label: string; icon: typeof Building2 }[] }[] = [
  {
    group: "Nhận diện",
    items: [
      { id: "identity", label: "Thông tin dòng họ", icon: Building2 },
      { id: "brand", label: "Thương hiệu & logo", icon: Palette },
    ],
  },
  {
    group: "Phả hệ",
    items: [
      { id: "tree", label: "Cài đặt cây phả hệ", icon: GitBranch },
      { id: "calendar", label: "Âm-dương lịch", icon: CalendarDays },
      { id: "code", label: "Mã hiệu thành viên", icon: Hash },
    ],
  },
  {
    group: "Thành viên & bảo mật",
    items: [
      { id: "auth", label: "Đăng ký & xác thực", icon: UserPlus },
      { id: "privacy", label: "Quyền riêng tư", icon: ShieldCheck },
      { id: "roles", label: "Phân quyền vai trò", icon: KeyRound },
    ],
  },
  {
    group: "Thông báo",
    items: [
      { id: "smtp", label: "Gửi thư điện tử", icon: Mail },
      { id: "zalo", label: "Kênh Zalo", icon: MessageCircle },
      { id: "notify", label: "Nhắc nhở & giỗ", icon: Bell },
    ],
  },
  {
    group: "Hệ thống",
    items: [
      { id: "backup", label: "Sao lưu & khôi phục", icon: Database },
      { id: "webhook", label: "Tích hợp sự kiện", icon: Link2 },
      { id: "audit", label: "Nhật ký thao tác", icon: ScrollText },
    ],
  },
];

const PROVINCES = [
  { value: "", label: "— Chọn —" },
  { value: "HN", label: "Hà Nội" },
  { value: "HP", label: "Hải Phòng" },
  { value: "ND", label: "Nam Định" },
  { value: "TH", label: "Thanh Hóa" },
  { value: "QT", label: "Quảng Trị" },
  { value: "QB", label: "Quảng Bình" },
];

const ROLE_ROWS = [
  {
    role: "Quản trị hệ thống",
    perms: "Toàn quyền cấu hình, thành viên, quỹ, duyệt và phả hệ",
  },
  {
    role: "Quản trị phả hệ",
    perms: "Sửa cây, người, hôn nhân; duyệt tự khai; xem nhật ký liên quan",
  },
  {
    role: "Biên tập viên",
    perms: "Sửa hồ sơ và tin tức được giao; không đổi cấu hình hệ thống",
  },
  {
    role: "Thành viên",
    perms: "Xem phả đồ theo quyền riêng tư; tự khai; đăng ký nhắc giỗ",
  },
];

const emptySettings = (): TreeSettingsDto => ({
  displayName: "",
  shortName: "",
  provinceCode: "",
  address: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  description: "",
  seoKeywords: [],
  bankName: "",
  bankBranch: "",
  bankAccountNo: "",
  bankAccountName: "",
  socialFacebook: "",
  socialZalo: "",
  brandPalette: "bang-vang",
  logoUrl: "",
  faviconUrl: "",
  tree: {
    maxNodesDefault: 43,
    publicTree: true,
    maskLivingBirthDate: true,
    allowSelfDeclare: true,
    allowTreeExport: false,
    codePrefix: "A",
  },
  notify: {
    remindDaysBefore: 7,
    remindHour: 8,
    channelEmail: true,
    channelZalo: false,
    channelWeb: true,
  },
  calendar: { timezone: "Asia/Ho_Chi_Minh", showLeapMonthLabel: true },
  auth: {
    publicRegistration: true,
    autoActivate: true,
    captchaEnabled: false,
    requireTerms: true,
  },
  privacy: { defaultLivingPrivacy: "members" },
  smtp: {
    configured: false,
    host: "",
    port: 587,
    tls: true,
    username: "",
    fromEmail: "",
    fromName: "",
    password: "",
  },
  zalo: { configured: false, mode: "off", oaId: "", appId: "", accessToken: "" },
  webhook: { enabled: false, url: "", secret: "", secretConfigured: false },
  backup: { enabled: false, schedule: "daily", runAt: "02:00" },
});

function mergeSettings(data: TreeSettingsDto): TreeSettingsDto {
  const e = emptySettings();
  return {
    ...e,
    ...data,
    tree: { ...e.tree, ...data.tree },
    notify: { ...e.notify, ...data.notify },
    calendar: { ...e.calendar, ...data.calendar },
    auth: { ...e.auth, ...data.auth },
    privacy: { ...e.privacy, ...data.privacy },
    smtp: { ...e.smtp, ...data.smtp, password: "" },
    zalo: { ...e.zalo, ...data.zalo, accessToken: "" },
    webhook: { ...e.webhook, ...data.webhook, secret: "" },
    backup: { ...e.backup, ...data.backup },
    seoKeywords: data.seoKeywords ?? [],
  };
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <div className={styles.toggleRow}>
      <div>
        <strong className={styles.toggleLabel}>{label}</strong>
        <span className={styles.toggleHint}>{hint}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={checked ? `${styles.switch} ${styles.switchOn}` : styles.switch}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.switchThumb} />
      </button>
    </div>
  );
}

function SectionCard({
  id,
  open,
  onToggle,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  id: SectionId;
  open: boolean;
  onToggle: () => void;
  icon: typeof Building2;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section id={`settings-${id}`} className={styles.card}>
      <button type="button" className={styles.cardHead} onClick={onToggle}>
        <span className={styles.cardIcon}>
          <Icon size={18} />
        </span>
        <span className={styles.cardTitles}>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </span>
        <ChevronRight size={18} className={open ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron} />
      </button>
      {open ? <div className={styles.cardBody}>{children}</div> : null}
    </section>
  );
}

export function SettingsPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<TreeSettingsDto>(emptySettings);
  const [baseline, setBaseline] = useState<string>("");
  const [open, setOpen] = useState<Record<SectionId, boolean>>(() => {
    const all = NAV.flatMap((g) => g.items.map((i) => i.id));
    return Object.fromEntries(all.map((id) => [id, id === "identity"])) as Record<SectionId, boolean>;
  });
  const [keywordDraft, setKeywordDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<SectionId>("identity");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const data = await getTreeSettings(slug, token);
      const merged = mergeSettings(data);
      setForm(merged);
      setBaseline(JSON.stringify(merged));
      if (merged.displayName) persistAdminSiteTitle(merged.displayName);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được cấu hình.");
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = useMemo(() => JSON.stringify(form) !== baseline, [form, baseline]);

  function patch<K extends keyof TreeSettingsDto>(key: K, value: TreeSettingsDto[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function patchNested<K extends keyof TreeSettingsDto>(
    key: K,
    partial: Partial<NonNullable<TreeSettingsDto[K]>>,
  ) {
    setForm((f) => ({
      ...f,
      [key]: { ...(f[key] as object), ...partial },
    }));
  }

  function addKeyword() {
    const k = keywordDraft.trim();
    if (!k) return;
    const list = [...(form.seoKeywords ?? [])];
    if (!list.includes(k)) list.push(k);
    patch("seoKeywords", list);
    setKeywordDraft("");
  }

  async function onSave() {
    if (!form.displayName?.trim()) {
      setError("Nhập tên dòng họ.");
      return;
    }
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      const token = await getAccessToken();
      const payload: TreeSettingsDto = {
        ...form,
        smtp: {
          ...form.smtp,
          password: form.smtp?.password?.trim() ? form.smtp.password : undefined,
        },
        zalo: {
          ...form.zalo,
          accessToken: form.zalo?.accessToken?.trim() ? form.zalo.accessToken : undefined,
        },
        webhook: {
          ...form.webhook,
          secret: form.webhook?.secret?.trim() ? form.webhook.secret : undefined,
        },
      };
      const saved = await updateTreeSettings(slug, payload, token);
      const merged = mergeSettings(saved);
      setForm(merged);
      setBaseline(JSON.stringify(merged));
      if (merged.displayName) persistAdminSiteTitle(merged.displayName);
      setStoredTreeSlug(slug);
      setToast("Đã lưu cấu hình — cổng thông tin cập nhật theo dữ liệu mới.");
      if (merged.brandPalette === "bang-vang" || merged.brandPalette === "co") {
        try {
          const raw = localStorage.getItem("giapha.appearance");
          const cur = raw ? JSON.parse(raw) : {};
          localStorage.setItem(
            "giapha.appearance",
            JSON.stringify({ ...cur, palette: merged.brandPalette }),
          );
          document.documentElement.setAttribute("data-palette", merged.brandPalette);
        } catch {
          /* ignore */
        }
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Lưu cấu hình thất bại.");
    } finally {
      setSaving(false);
    }
  }

  function onReset() {
    if (!baseline) return;
    setForm(JSON.parse(baseline) as TreeSettingsDto);
    setError(null);
  }

  function scrollTo(id: SectionId) {
    setActiveNav(id);
    setOpen((o) => ({ ...o, [id]: true }));
    document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onUpload(kind: "logo" | "favicon", file: File | undefined) {
    if (!file) return;
    setUploading(kind);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await uploadMediaPhoto(
        file,
        { caption: kind === "logo" ? "Logo dòng họ" : "Biểu tượng trang" },
        token,
      );
      const url = res.imgproxyUrl || res.presignedGetUrl;
      if (kind === "logo") patch("logoUrl", url);
      else patch("faviconUrl", url);
      setToast(kind === "logo" ? "Đã tải logo — nhớ Lưu cấu hình." : "Đã tải biểu tượng — nhớ Lưu cấu hình.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được ảnh.");
    } finally {
      setUploading(null);
    }
  }

  async function onTestSmtp() {
    setTestingSmtp(true);
    setError(null);
    setToast(null);
    try {
      const token = await getAccessToken();
      const res = await testTreeSmtp(slug, form.contactEmail ?? undefined, token);
      setToast(res.message || "Đã gửi thử thành công.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không gửi được thư thử.");
    } finally {
      setTestingSmtp(false);
    }
  }

  const prefixPreview = (form.tree?.codePrefix ?? "A").trim().toUpperCase() || "A";
  const zaloMode = form.zalo?.mode ?? "off";
  const canSuggestZalo = zaloMode !== "off" && !!form.notify?.channelZalo;

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Cấu hình"
        description="Thiết lập dòng họ, phả hệ, thông báo và vận hành — lưu vào cơ sở dữ liệu, cổng thông tin đọc trực tiếp."
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}
      {toast ? (
        <Alert title="Thành công" variant="success">
          {toast}
        </Alert>
      ) : null}

      {loading ? (
        <p className={styles.muted}>Đang tải cấu hình…</p>
      ) : (
        <div className={styles.layout}>
          <nav className={styles.nav} aria-label="Mục cấu hình">
            <p className={styles.navLead}>Thiết lập hệ thống</p>
            {NAV.map((g) => (
              <div key={g.group} className={styles.navGroup}>
                <span className={styles.navGroupLabel}>{g.group}</span>
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        activeNav === item.id ? `${styles.navItem} ${styles.navItemOn}` : styles.navItem
                      }
                      onClick={() => scrollTo(item.id)}
                    >
                      <Icon size={15} /> {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className={styles.main}>
            <SectionCard
              id="identity"
              open={open.identity}
              onToggle={() => setOpen((o) => ({ ...o, identity: !o.identity }))}
              icon={Building2}
              title="Thông tin dòng họ"
              subtitle="Tên, địa chỉ, liên hệ, SEO — hiện trên cổng thông tin"
            >
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Tên dòng họ</div>
                  <div className={styles.hint}>Tiêu đề portal và thanh điều hướng quản trị</div>
                </div>
                <Input value={form.displayName ?? ""} onChange={(e) => patch("displayName", e.target.value)} />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Tên viết tắt</div>
                </div>
                <Input value={form.shortName ?? ""} onChange={(e) => patch("shortName", e.target.value)} />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Tỉnh / thành gốc</div>
                </div>
                <Select
                  options={PROVINCES}
                  value={form.provinceCode ?? ""}
                  onChange={(e) => patch("provinceCode", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Địa chỉ nhà từ đường</div>
                </div>
                <Input value={form.address ?? ""} onChange={(e) => patch("address", e.target.value)} />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Người liên hệ</div>
                  <div className={styles.hint}>Footer cổng thông tin</div>
                </div>
                <div className={styles.row2}>
                  <Input
                    value={form.contactName ?? ""}
                    onChange={(e) => patch("contactName", e.target.value)}
                    placeholder="Họ tên"
                  />
                  <Input
                    value={form.contactPhone ?? ""}
                    onChange={(e) => patch("contactPhone", e.target.value)}
                    placeholder="Điện thoại"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Email liên hệ</div>
                </div>
                <Input
                  type="email"
                  value={form.contactEmail ?? ""}
                  onChange={(e) => patch("contactEmail", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Mô tả ngắn</div>
                </div>
                <Textarea
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(e) => patch("description", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Từ khóa tìm kiếm</div>
                </div>
                <div>
                  <div className={styles.tags}>
                    {(form.seoKeywords ?? []).map((k) => (
                      <span key={k} className={styles.tag}>
                        {k}
                        <button
                          type="button"
                          className={styles.tagRm}
                          aria-label={`Xóa ${k}`}
                          onClick={() =>
                            patch(
                              "seoKeywords",
                              (form.seoKeywords ?? []).filter((x) => x !== k),
                            )
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      className={styles.tagInput}
                      value={keywordDraft}
                      placeholder="Thêm…"
                      onChange={(e) => setKeywordDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Quỹ công đức (footer)</div>
                </div>
                <div className={styles.row2}>
                  <Input
                    value={form.bankName ?? ""}
                    onChange={(e) => patch("bankName", e.target.value)}
                    placeholder="Ngân hàng"
                  />
                  <Input
                    value={form.bankBranch ?? ""}
                    onChange={(e) => patch("bankBranch", e.target.value)}
                    placeholder="Chi nhánh"
                  />
                  <Input
                    value={form.bankAccountNo ?? ""}
                    onChange={(e) => patch("bankAccountNo", e.target.value)}
                    placeholder="Số tài khoản"
                  />
                  <Input
                    value={form.bankAccountName ?? ""}
                    onChange={(e) => patch("bankAccountName", e.target.value)}
                    placeholder="Chủ tài khoản"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Mạng xã hội</div>
                </div>
                <div className={styles.row2}>
                  <Input
                    value={form.socialFacebook ?? ""}
                    onChange={(e) => patch("socialFacebook", e.target.value)}
                    placeholder="Đường dẫn Facebook"
                  />
                  <Input
                    value={form.socialZalo ?? ""}
                    onChange={(e) => patch("socialZalo", e.target.value)}
                    placeholder="Đường dẫn Zalo"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              id="brand"
              open={open.brand}
              onToggle={() => setOpen((o) => ({ ...o, brand: !o.brand }))}
              icon={Palette}
              title="Thương hiệu & logo"
              subtitle="Logo, biểu tượng trang và bảng màu"
            >
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Bảng màu chủ đạo</div>
                </div>
                <Select
                  options={[
                    { value: "bang-vang", label: "Bảng vàng" },
                    { value: "co", label: "Cổ (son đỏ)" },
                  ]}
                  value={form.brandPalette ?? "bang-vang"}
                  onChange={(e) => patch("brandPalette", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Logo cổng thông tin</div>
                  <div className={styles.hint}>PNG/SVG khuyến nghị ≥200×80</div>
                </div>
                <div className={styles.row2}>
                  <Input
                    value={form.logoUrl ?? ""}
                    onChange={(e) => patch("logoUrl", e.target.value)}
                    placeholder="Đường dẫn logo"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={uploading === "logo"}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload size={16} /> {uploading === "logo" ? "Đang tải…" : "Tải lên"}
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/webp"
                    hidden
                    onChange={(e) => void onUpload("logo", e.target.files?.[0])}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Biểu tượng trang</div>
                  <div className={styles.hint}>ICO/PNG 32×32</div>
                </div>
                <div className={styles.row2}>
                  <Input
                    value={form.faviconUrl ?? ""}
                    onChange={(e) => patch("faviconUrl", e.target.value)}
                    placeholder="Đường dẫn biểu tượng"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={uploading === "favicon"}
                    onClick={() => faviconInputRef.current?.click()}
                  >
                    <Upload size={16} /> {uploading === "favicon" ? "Đang tải…" : "Tải lên"}
                  </Button>
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/webp"
                    hidden
                    onChange={(e) => void onUpload("favicon", e.target.files?.[0])}
                  />
                </div>
              </div>
              {(form.logoUrl || form.faviconUrl) && (
                <p className={styles.muted}>
                  <button type="button" className={styles.linkBtn} onClick={() => patch("logoUrl", "")}>
                    Xóa logo
                  </button>
                  {" · "}
                  <button type="button" className={styles.linkBtn} onClick={() => patch("faviconUrl", "")}>
                    Xóa biểu tượng
                  </button>
                </p>
              )}
            </SectionCard>

            <SectionCard
              id="tree"
              open={open.tree}
              onToggle={() => setOpen((o) => ({ ...o, tree: !o.tree }))}
              icon={GitBranch}
              title="Cài đặt cây phả hệ"
              subtitle="Hiển thị công khai, tự khai, xuất phả đồ"
            >
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Số node mặc định trên portal</div>
                </div>
                <Input
                  type="number"
                  style={{ maxWidth: 120 }}
                  value={String(form.tree?.maxNodesDefault ?? 43)}
                  onChange={(e) =>
                    patchNested("tree", { maxNodesDefault: Number(e.target.value) || 43 })
                  }
                />
              </div>
              <div className={styles.toggles}>
                <Toggle
                  checked={!!form.tree?.publicTree}
                  onChange={(v) => patchNested("tree", { publicTree: v })}
                  label="Cho phép khách xem phả đồ"
                  hint="Không cần đăng nhập vẫn xem cây cơ bản"
                />
                <Toggle
                  checked={!!form.tree?.allowSelfDeclare}
                  onChange={(v) => patchNested("tree", { allowSelfDeclare: v })}
                  label="Cho phép tự khai bổ sung hồ sơ"
                  hint="Thành viên gửi yêu cầu, chờ ban quản trị duyệt"
                />
                <Toggle
                  checked={!!form.tree?.allowTreeExport}
                  onChange={(v) => patchNested("tree", { allowTreeExport: v })}
                  label="Cho phép xuất ảnh phả đồ trên portal"
                  hint="Hiện nút tải ảnh trên trang gia phả"
                />
              </div>
            </SectionCard>

            <SectionCard
              id="calendar"
              open={open.calendar}
              onToggle={() => setOpen((o) => ({ ...o, calendar: !o.calendar }))}
              icon={CalendarDays}
              title="Âm-dương lịch"
              subtitle="Múi giờ và quy ước tháng nhuận"
            >
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Múi giờ hiển thị</div>
                </div>
                <Select
                  options={[
                    { value: "Asia/Ho_Chi_Minh", label: "Việt Nam (UTC+7)" },
                    { value: "Asia/Bangkok", label: "Bangkok (UTC+7)" },
                    { value: "UTC", label: "UTC" },
                  ]}
                  value={form.calendar?.timezone ?? "Asia/Ho_Chi_Minh"}
                  onChange={(e) => patchNested("calendar", { timezone: e.target.value })}
                />
              </div>
              <div className={styles.toggles}>
                <Toggle
                  checked={form.calendar?.showLeapMonthLabel !== false}
                  onChange={(v) => patchNested("calendar", { showLeapMonthLabel: v })}
                  label="Hiện nhãn tháng nhuận"
                  hint="Hiển thị chữ «Nhuận» khi ngày âm thuộc tháng nhuận"
                />
              </div>
            </SectionCard>

            <SectionCard
              id="code"
              open={open.code}
              onToggle={() => setOpen((o) => ({ ...o, code: !o.code }))}
              icon={Hash}
              title="Mã hiệu thành viên"
              subtitle="Tiền tố khi sinh mã người mới — không đổi mã đã có"
            >
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Prefix mã hiệu</div>
                  <div className={styles.hint}>1–3 ký tự chữ, viết hoa</div>
                </div>
                <Input
                  style={{ maxWidth: 80, textAlign: "center", fontWeight: 700 }}
                  value={form.tree?.codePrefix ?? "A"}
                  maxLength={4}
                  onChange={(e) =>
                    patchNested("tree", { codePrefix: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <p className={styles.muted}>
                Người tiếp theo sẽ nhận mã dạng {prefixPreview}… (ví dụ {prefixPreview}7, {prefixPreview}
                7-sp1).
              </p>
            </SectionCard>

            <SectionCard
              id="auth"
              open={open.auth}
              onToggle={() => setOpen((o) => ({ ...o, auth: !o.auth }))}
              icon={UserPlus}
              title="Đăng ký & xác thực"
              subtitle="Quy tắc đăng ký thành viên trên cổng thông tin"
            >
              <div className={styles.toggles}>
                <Toggle
                  checked={form.auth?.publicRegistration !== false}
                  onChange={(v) => patchNested("auth", { publicRegistration: v })}
                  label="Cho phép đăng ký công khai"
                  hint="Khách tạo tài khoản trên cổng thông tin"
                />
                <Toggle
                  checked={form.auth?.autoActivate !== false}
                  onChange={(v) => patchNested("auth", { autoActivate: v })}
                  label="Tự kích hoạt sau khi xác nhận thư"
                  hint="Tắt thì chờ ban quản trị duyệt thủ công"
                />
                <Toggle
                  checked={!!form.auth?.captchaEnabled}
                  onChange={(v) => patchNested("auth", { captchaEnabled: v })}
                  label="Bật kiểm tra người thật khi đăng ký"
                  hint="Giảm đăng ký tự động giả mạo"
                />
                <Toggle
                  checked={form.auth?.requireTerms !== false}
                  onChange={(v) => patchNested("auth", { requireTerms: v })}
                  label="Bắt buộc đồng ý quy định thành viên"
                  hint="Hiện hộp xác nhận trước khi tạo tài khoản"
                />
              </div>
            </SectionCard>

            <SectionCard
              id="privacy"
              open={open.privacy}
              onToggle={() => setOpen((o) => ({ ...o, privacy: !o.privacy }))}
              icon={ShieldCheck}
              title="Quyền riêng tư"
              subtitle="Mức mặc định hồ sơ người còn sống và che ngày sinh"
            >
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Mức riêng tư mặc định (người còn sống)</div>
                </div>
                <Select
                  options={[
                    { value: "members", label: "Chỉ thành viên" },
                    { value: "public", label: "Công khai" },
                    { value: "private", label: "Riêng tư (chỉ ban quản trị)" },
                  ]}
                  value={form.privacy?.defaultLivingPrivacy ?? "members"}
                  onChange={(e) => patchNested("privacy", { defaultLivingPrivacy: e.target.value })}
                />
              </div>
              <div className={styles.toggles}>
                <Toggle
                  checked={form.tree?.maskLivingBirthDate !== false}
                  onChange={(v) => patchNested("tree", { maskLivingBirthDate: v })}
                  label="Ẩn ngày sinh đầy đủ người còn sống với khách"
                  hint="Theo quy định bảo vệ thông tin cá nhân"
                />
              </div>
            </SectionCard>

            <SectionCard
              id="roles"
              open={open.roles}
              onToggle={() => setOpen((o) => ({ ...o, roles: !o.roles }))}
              icon={KeyRound}
              title="Phân quyền vai trò"
              subtitle="Ma trận vai trò — chỉ xem; gán người dùng ở thành viên"
            >
              <div className={styles.roleTable}>
                <div className={styles.roleHead}>
                  <span>Vai trò</span>
                  <span>Quyền nghiệp vụ</span>
                </div>
                {ROLE_ROWS.map((r) => (
                  <div key={r.role} className={styles.roleRow}>
                    <strong>{r.role}</strong>
                    <span>{r.perms}</span>
                  </div>
                ))}
              </div>
              <p className={styles.muted}>
                Gán vai trò tại <Link to="/users">Tài khoản</Link>. Thư ký nhánh
                sẽ giới hạn theo nhánh đời ở giai đoạn sau.
              </p>
            </SectionCard>

            <SectionCard
              id="smtp"
              open={open.smtp}
              onToggle={() => setOpen((o) => ({ ...o, smtp: !o.smtp }))}
              icon={Mail}
              title="Gửi thư điện tử"
              subtitle="Máy chủ gửi thư kích hoạt, quên mật khẩu, nhắc giỗ"
            >
              {form.smtp?.configured ? (
                <p className={styles.muted}>Đã có mật khẩu máy chủ — để trống ô mật khẩu nếu không đổi.</p>
              ) : (
                <p className={styles.muted}>Chưa cấu hình máy chủ gửi thư.</p>
              )}
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Máy chủ / Cổng</div>
                </div>
                <div className={styles.row2}>
                  <Input
                    value={form.smtp?.host ?? ""}
                    onChange={(e) => patchNested("smtp", { host: e.target.value })}
                    placeholder="Địa chỉ máy chủ"
                  />
                  <Input
                    type="number"
                    style={{ maxWidth: 100 }}
                    value={String(form.smtp?.port ?? 587)}
                    onChange={(e) => patchNested("smtp", { port: Number(e.target.value) || 587 })}
                  />
                </div>
              </div>
              <div className={styles.toggles}>
                <Toggle
                  checked={form.smtp?.tls !== false}
                  onChange={(v) => patchNested("smtp", { tls: v })}
                  label="Kết nối bảo mật (TLS)"
                  hint="Khuyến nghị bật trên môi trường thật"
                />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Tài khoản gửi</div>
                </div>
                <div className={styles.row2}>
                  <Input
                    value={form.smtp?.username ?? ""}
                    onChange={(e) => patchNested("smtp", { username: e.target.value })}
                    placeholder="Tên đăng nhập"
                  />
                  <Input
                    type="password"
                    value={form.smtp?.password ?? ""}
                    onChange={(e) => patchNested("smtp", { password: e.target.value })}
                    placeholder={form.smtp?.configured ? "••••••••" : "Mật khẩu"}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Địa chỉ & tên người gửi</div>
                </div>
                <div className={styles.row2}>
                  <Input
                    value={form.smtp?.fromEmail ?? ""}
                    onChange={(e) => patchNested("smtp", { fromEmail: e.target.value })}
                    placeholder="email@dongho.vn"
                  />
                  <Input
                    value={form.smtp?.fromName ?? ""}
                    onChange={(e) => patchNested("smtp", { fromName: e.target.value })}
                    placeholder="Tên hiển thị"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={testingSmtp || !form.smtp?.host}
                onClick={() => void onTestSmtp()}
              >
                {testingSmtp ? "Đang gửi thử…" : "Gửi thử tới email liên hệ"}
              </Button>
            </SectionCard>

            <SectionCard
              id="zalo"
              open={open.zalo}
              onToggle={() => setOpen((o) => ({ ...o, zalo: !o.zalo }))}
              icon={MessageCircle}
              title="Kênh Zalo"
              subtitle="Gửi nhắc giỗ qua Zalo — tắt thì portal không đề xuất kênh này"
            >
              {form.zalo?.configured ? (
                <p className={styles.muted}>Đã có mã truy cập — để trống nếu không đổi.</p>
              ) : null}
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Chế độ</div>
                </div>
                <Select
                  options={[
                    { value: "off", label: "Tắt" },
                    { value: "dry_run", label: "Chạy thử (chỉ ghi nhật ký)" },
                    { value: "live", label: "Gửi thật" },
                  ]}
                  value={zaloMode}
                  onChange={(e) => patchNested("zalo", { mode: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Định danh ứng dụng</div>
                </div>
                <div className={styles.row2}>
                  <Input
                    value={form.zalo?.oaId ?? ""}
                    onChange={(e) => patchNested("zalo", { oaId: e.target.value })}
                    placeholder="Mã OA"
                  />
                  <Input
                    value={form.zalo?.appId ?? ""}
                    onChange={(e) => patchNested("zalo", { appId: e.target.value })}
                    placeholder="Mã ứng dụng"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Mã truy cập</div>
                </div>
                <Input
                  type="password"
                  value={form.zalo?.accessToken ?? ""}
                  onChange={(e) => patchNested("zalo", { accessToken: e.target.value })}
                  placeholder={form.zalo?.configured ? "••••••••" : "Dán mã truy cập"}
                  autoComplete="new-password"
                />
              </div>
            </SectionCard>

            <SectionCard
              id="notify"
              open={open.notify}
              onToggle={() => setOpen((o) => ({ ...o, notify: !o.notify }))}
              icon={Bell}
              title="Nhắc nhở & ngày giỗ"
              subtitle="Mặc định khi thành viên đăng ký nhắc"
            >
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Nhắc trước (ngày)</div>
                </div>
                <Input
                  type="number"
                  style={{ maxWidth: 120 }}
                  value={String(form.notify?.remindDaysBefore ?? 7)}
                  onChange={(e) =>
                    patchNested("notify", {
                      remindDaysBefore: Math.min(30, Math.max(0, Number(e.target.value) || 0)),
                    })
                  }
                />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Giờ gửi tin nhắc</div>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  style={{ maxWidth: 120 }}
                  value={String(form.notify?.remindHour ?? 8)}
                  onChange={(e) =>
                    patchNested("notify", {
                      remindHour: Math.min(23, Math.max(0, Number(e.target.value) || 0)),
                    })
                  }
                />
              </div>
              <div className={styles.toggles}>
                <Toggle
                  checked={!!form.notify?.channelEmail}
                  onChange={(v) => patchNested("notify", { channelEmail: v })}
                  label="Gợi ý kênh thư điện tử"
                  hint="Hiển thị lựa chọn gửi thư khi đăng ký nhắc"
                />
                <Toggle
                  checked={!!form.notify?.channelZalo}
                  onChange={(v) => patchNested("notify", { channelZalo: v })}
                  label="Gợi ý kênh Zalo"
                  hint={
                    zaloMode === "off"
                      ? "Bật chế độ Zalo ở mục trên trước khi gợi ý kênh này"
                      : "Portal chỉ hiện khi chế độ Zalo không phải Tắt"
                  }
                />
                <Toggle
                  checked={form.notify?.channelWeb !== false}
                  onChange={(v) => patchNested("notify", { channelWeb: v })}
                  label="Gợi ý thông báo trên cổng"
                  hint="Tin nhắc hiển thị trên cổng thông tin khi thành viên đăng nhập"
                />
              </div>
              {!canSuggestZalo && form.notify?.channelZalo ? (
                <p className={styles.muted}>Kênh Zalo đang tắt ở chế độ — cổng thông tin sẽ không đề xuất.</p>
              ) : null}
              <p className={styles.muted}>
                Xem hàng đợi tại <Link to="/notifications">Nhắc giỗ (quản trị)</Link>.
              </p>
            </SectionCard>

            <SectionCard
              id="backup"
              open={open.backup}
              onToggle={() => setOpen((o) => ({ ...o, backup: !o.backup }))}
              icon={Database}
              title="Sao lưu & khôi phục"
              subtitle="Lịch sao lưu dữ liệu và hướng dẫn khôi phục"
            >
              <div className={styles.toggles}>
                <Toggle
                  checked={!!form.backup?.enabled}
                  onChange={(v) => patchNested("backup", { enabled: v })}
                  label="Bật lịch sao lưu tự động"
                  hint="Sao lưu cơ sở dữ liệu và thư viện ảnh theo lịch"
                />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Chu kỳ / Giờ chạy</div>
                </div>
                <div className={styles.row2}>
                  <Select
                    options={[
                      { value: "daily", label: "Hằng ngày" },
                      { value: "weekly", label: "Hằng tuần" },
                    ]}
                    value={form.backup?.schedule ?? "daily"}
                    onChange={(e) => patchNested("backup", { schedule: e.target.value })}
                  />
                  <Input
                    value={form.backup?.runAt ?? "02:00"}
                    onChange={(e) => patchNested("backup", { runAt: e.target.value })}
                    placeholder="02:00"
                    style={{ maxWidth: 100 }}
                  />
                </div>
              </div>
              <p className={styles.muted}>
                Khôi phục: liên hệ quản trị tối cao — xác nhận hai bước theo quy trình vận hành. Danh sách bản
                sao lưu gần đây sẽ hiện khi job đã chạy trên máy chủ.
              </p>
            </SectionCard>

            <SectionCard
              id="webhook"
              open={open.webhook}
              onToggle={() => setOpen((o) => ({ ...o, webhook: !o.webhook }))}
              icon={Link2}
              title="Tích hợp sự kiện"
              subtitle="Nhận thông báo khi có thay đổi người, duyệt tự khai, quỹ…"
            >
              <div className={styles.toggles}>
                <Toggle
                  checked={!!form.webhook?.enabled}
                  onChange={(v) => patchNested("webhook", { enabled: v })}
                  label="Bật gửi sự kiện ra ngoài"
                  hint="Hệ thống gọi đường dẫn bạn đăng ký khi có sự kiện"
                />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Đường dẫn nhận sự kiện</div>
                </div>
                <Input
                  value={form.webhook?.url ?? ""}
                  onChange={(e) => patchNested("webhook", { url: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <div className={styles.field}>
                <div>
                  <div className={styles.label}>Mã bí mật ký sự kiện</div>
                  <div className={styles.hint}>
                    {form.webhook?.secretConfigured
                      ? "Đã cấu hình — để trống nếu không đổi"
                      : "Dùng để đối phương xác minh nguồn gửi"}
                  </div>
                </div>
                <Input
                  type="password"
                  value={form.webhook?.secret ?? ""}
                  onChange={(e) => patchNested("webhook", { secret: e.target.value })}
                  placeholder={form.webhook?.secretConfigured ? "••••••••" : "Mã bí mật"}
                  autoComplete="new-password"
                />
              </div>
            </SectionCard>

            <SectionCard
              id="audit"
              open={open.audit}
              onToggle={() => setOpen((o) => ({ ...o, audit: !o.audit }))}
              icon={ScrollText}
              title="Nhật ký thao tác"
              subtitle="Ai · lúc nào · làm gì — lọc theo module và thời gian"
            >
              <div className={styles.toggles}>
                <div className={styles.toggleRow}>
                  <div>
                    <strong className={styles.toggleLabel}>Ghi nhật ký cấu hình & phả hệ</strong>
                    <span className={styles.toggleHint}>
                      Luôn bật cho thao tác lưu cấu hình, sửa người, duyệt tự khai
                    </span>
                  </div>
                  <Shield size={18} aria-hidden />
                </div>
              </div>
              <p className={styles.muted}>
                Xem nhật ký chi tiết tại <Link to="/system">Module hệ thống</Link>. Bộ lọc nâng cao (module /
                người / thời gian) sẽ mở rộng ở giai đoạn vận hành production.
              </p>
            </SectionCard>

            <div className={styles.saveBar}>
              <span className={styles.saveHint}>
                {dirty ? "Có thay đổi chưa lưu" : "Đã đồng bộ với cơ sở dữ liệu"}
              </span>
              <div className={styles.saveActions}>
                <Button type="button" variant="secondary" disabled={!dirty || saving} onClick={onReset}>
                  Đặt lại
                </Button>
                <Button type="button" disabled={!dirty || saving} onClick={() => void onSave()}>
                  <Save size={16} /> {saving ? "Đang lưu…" : "Lưu cấu hình"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
