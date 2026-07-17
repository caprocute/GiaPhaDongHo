import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import { Alert, Button, Input, Select, Textarea } from "@giapha/ui";
import {
  Building2,
  ChevronRight,
  GitBranch,
  Hash,
  Mail,
  Palette,
  Save,
  Shield,
  Bell,
} from "lucide-react";
import {
  defaultTreeSlug,
  getTreeSettings,
  setStoredTreeSlug,
  updateTreeSettings,
  type TreeSettingsDto,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { persistAdminSiteTitle } from "../lib/siteTitle";
import styles from "./settings.module.css";

type SectionId = "identity" | "brand" | "tree" | "notify";

const PROVINCES = [
  { value: "", label: "— Chọn —" },
  { value: "HN", label: "Hà Nội" },
  { value: "HP", label: "Hải Phòng" },
  { value: "ND", label: "Nam Định" },
  { value: "TH", label: "Thanh Hóa" },
  { value: "QT", label: "Quảng Trị" },
  { value: "QB", label: "Quảng Bình" },
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
    channelEmail: true,
    channelZalo: false,
  },
});

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

export function SettingsPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [form, setForm] = useState<TreeSettingsDto>(emptySettings);
  const [baseline, setBaseline] = useState<string>("");
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    identity: true,
    brand: true,
    tree: true,
    notify: true,
  });
  const [keywordDraft, setKeywordDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<SectionId>("identity");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const data = await getTreeSettings(slug, token);
      const merged = { ...emptySettings(), ...data, tree: { ...emptySettings().tree, ...data.tree }, notify: { ...emptySettings().notify, ...data.notify } };
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

  function patchTree(partial: Partial<NonNullable<TreeSettingsDto["tree"]>>) {
    setForm((f) => ({ ...f, tree: { ...f.tree, ...partial } }));
  }

  function patchNotify(partial: Partial<NonNullable<TreeSettingsDto["notify"]>>) {
    setForm((f) => ({ ...f, notify: { ...f.notify, ...partial } }));
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
      const saved = await updateTreeSettings(slug, form, token);
      const merged = { ...emptySettings(), ...saved, tree: { ...emptySettings().tree, ...saved.tree }, notify: { ...emptySettings().notify, ...saved.notify } };
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

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Cấu hình"
        description="Thiết lập dòng họ, thương hiệu và phả hệ — lưu vào cơ sở dữ liệu, cổng thông tin đọc trực tiếp."
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
            <div className={styles.navGroup}>
              <span className={styles.navGroupLabel}>Nhận diện</span>
              <button
                type="button"
                className={activeNav === "identity" ? `${styles.navItem} ${styles.navItemOn}` : styles.navItem}
                onClick={() => scrollTo("identity")}
              >
                <Building2 size={15} /> Thông tin dòng họ
              </button>
              <button
                type="button"
                className={activeNav === "brand" ? `${styles.navItem} ${styles.navItemOn}` : styles.navItem}
                onClick={() => scrollTo("brand")}
              >
                <Palette size={15} /> Thương hiệu
              </button>
            </div>
            <div className={styles.navGroup}>
              <span className={styles.navGroupLabel}>Phả hệ</span>
              <button
                type="button"
                className={activeNav === "tree" ? `${styles.navItem} ${styles.navItemOn}` : styles.navItem}
                onClick={() => scrollTo("tree")}
              >
                <GitBranch size={15} /> Cây phả hệ
              </button>
              <button type="button" className={styles.navItem} onClick={() => scrollTo("tree")}>
                <Hash size={15} /> Mã hiệu thành viên
              </button>
            </div>
            <div className={styles.navGroup}>
              <span className={styles.navGroupLabel}>Thông báo</span>
              <button
                type="button"
                className={activeNav === "notify" ? `${styles.navItem} ${styles.navItemOn}` : styles.navItem}
                onClick={() => scrollTo("notify")}
              >
                <Bell size={15} /> Nhắc nhở & giỗ
              </button>
              <Link to="/notifications" className={styles.navItem}>
                <Mail size={15} /> Hàng đợi gửi thư
              </Link>
            </div>
            <div className={styles.navGroup}>
              <span className={styles.navGroupLabel}>Hệ thống</span>
              <Link to="/system" className={styles.navItem}>
                <Shield size={15} /> Module hệ thống
              </Link>
            </div>
          </nav>

          <div className={styles.main}>
            <section id="settings-identity" className={styles.card}>
              <button
                type="button"
                className={styles.cardHead}
                onClick={() => setOpen((o) => ({ ...o, identity: !o.identity }))}
              >
                <span className={styles.cardIcon}>
                  <Building2 size={18} />
                </span>
                <span className={styles.cardTitles}>
                  <strong>Thông tin dòng họ</strong>
                  <span>Tên, địa chỉ, liên hệ, SEO — hiện trên cổng thông tin</span>
                </span>
                <ChevronRight
                  size={18}
                  className={open.identity ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}
                />
              </button>
              {open.identity ? (
                <div className={styles.cardBody}>
                  <div className={styles.field}>
                    <div>
                      <div className={styles.label}>Tên dòng họ</div>
                      <div className={styles.hint}>Tiêu đề portal và thanh điều hướng quản trị</div>
                    </div>
                    <Input
                      value={form.displayName ?? ""}
                      onChange={(e) => patch("displayName", e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <div>
                      <div className={styles.label}>Tên viết tắt</div>
                      <div className={styles.hint}>Dùng khi xuất và tham chiếu ngắn</div>
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
                      <div className={styles.hint}>Thẻ mô tả trang và chia sẻ</div>
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
                </div>
              ) : null}
            </section>

            <section id="settings-brand" className={styles.card}>
              <button
                type="button"
                className={styles.cardHead}
                onClick={() => setOpen((o) => ({ ...o, brand: !o.brand }))}
              >
                <span className={styles.cardIcon}>
                  <Palette size={18} />
                </span>
                <span className={styles.cardTitles}>
                  <strong>Thương hiệu</strong>
                  <span>Bảng màu giao diện — áp dụng portal và quản trị</span>
                </span>
                <ChevronRight
                  size={18}
                  className={open.brand ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}
                />
              </button>
              {open.brand ? (
                <div className={styles.cardBody}>
                  <div className={styles.field}>
                    <div>
                      <div className={styles.label}>Bảng màu chủ đạo</div>
                      <div className={styles.hint}>Đồng bộ với bộ chọn giao diện trên cổng thông tin</div>
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
                      <div className={styles.label}>Logo / Favicon</div>
                      <div className={styles.hint}>Dán đường dẫn ảnh đã tải lên thư viện media</div>
                    </div>
                    <div className={styles.row2}>
                      <Input
                        value={form.logoUrl ?? ""}
                        onChange={(e) => patch("logoUrl", e.target.value)}
                        placeholder="Đường dẫn logo"
                      />
                      <Input
                        value={form.faviconUrl ?? ""}
                        onChange={(e) => patch("faviconUrl", e.target.value)}
                        placeholder="Đường dẫn favicon"
                      />
                    </div>
                  </div>
                  <p className={styles.muted}>
                    Tải ảnh tại <Link to="/media">Thư viện media</Link> rồi dán đường dẫn vào đây.
                  </p>
                </div>
              ) : null}
            </section>

            <section id="settings-tree" className={styles.card}>
              <button
                type="button"
                className={styles.cardHead}
                onClick={() => setOpen((o) => ({ ...o, tree: !o.tree }))}
              >
                <span className={styles.cardIcon}>
                  <GitBranch size={18} />
                </span>
                <span className={styles.cardTitles}>
                  <strong>Cài đặt cây phả hệ</strong>
                  <span>Hiển thị công khai, PII, tự khai, mã hiệu</span>
                </span>
                <ChevronRight
                  size={18}
                  className={open.tree ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}
                />
              </button>
              {open.tree ? (
                <div className={styles.cardBody}>
                  <div className={styles.field}>
                    <div>
                      <div className={styles.label}>Số node mặc định trên portal</div>
                      <div className={styles.hint}>Giới hạn tải lần đầu trang phả đồ</div>
                    </div>
                    <Input
                      type="number"
                      style={{ maxWidth: 120 }}
                      value={String(form.tree?.maxNodesDefault ?? 43)}
                      onChange={(e) => patchTree({ maxNodesDefault: Number(e.target.value) || 43 })}
                    />
                  </div>
                  <div className={styles.toggles}>
                    <Toggle
                      checked={!!form.tree?.publicTree}
                      onChange={(v) => patchTree({ publicTree: v })}
                      label="Cho phép khách xem phả đồ"
                      hint="Không cần đăng nhập vẫn xem cây cơ bản"
                    />
                    <Toggle
                      checked={!!form.tree?.maskLivingBirthDate}
                      onChange={(v) => patchTree({ maskLivingBirthDate: v })}
                      label="Ẩn ngày sinh đầy đủ người còn sống"
                      hint="Khách chỉ thấy mức bảo vệ theo quy định riêng tư"
                    />
                    <Toggle
                      checked={!!form.tree?.allowSelfDeclare}
                      onChange={(v) => patchTree({ allowSelfDeclare: v })}
                      label="Cho phép tự khai bổ sung hồ sơ"
                      hint="Thành viên gửi yêu cầu, chờ ban quản trị duyệt"
                    />
                    <Toggle
                      checked={!!form.tree?.allowTreeExport}
                      onChange={(v) => patchTree({ allowTreeExport: v })}
                      label="Cho phép xuất ảnh phả đồ trên portal"
                      hint="Hiện nút tải SVG/PNG trên trang gia phả"
                    />
                  </div>
                  <div className={styles.field}>
                    <div>
                      <div className={styles.label}>Prefix mã hiệu</div>
                      <div className={styles.hint}>Ký tự đầu khi hệ thống sinh mã thành viên mới</div>
                    </div>
                    <Input
                      style={{ maxWidth: 80, textAlign: "center", fontWeight: 700 }}
                      value={form.tree?.codePrefix ?? "A"}
                      maxLength={4}
                      onChange={(e) => patchTree({ codePrefix: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
              ) : null}
            </section>

            <section id="settings-notify" className={styles.card}>
              <button
                type="button"
                className={styles.cardHead}
                onClick={() => setOpen((o) => ({ ...o, notify: !o.notify }))}
              >
                <span className={styles.cardIcon}>
                  <Bell size={18} />
                </span>
                <span className={styles.cardTitles}>
                  <strong>Nhắc nhở & ngày giỗ</strong>
                  <span>Mặc định khi thành viên đăng ký nhắc</span>
                </span>
                <ChevronRight
                  size={18}
                  className={open.notify ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}
                />
              </button>
              {open.notify ? (
                <div className={styles.cardBody}>
                  <div className={styles.field}>
                    <div>
                      <div className={styles.label}>Nhắc trước (ngày)</div>
                      <div className={styles.hint}>Gợi ý mặc định trên trang nhắc giỗ portal</div>
                    </div>
                    <Input
                      type="number"
                      style={{ maxWidth: 120 }}
                      value={String(form.notify?.remindDaysBefore ?? 7)}
                      onChange={(e) =>
                        patchNotify({ remindDaysBefore: Math.min(30, Math.max(0, Number(e.target.value) || 0)) })
                      }
                    />
                  </div>
                  <div className={styles.toggles}>
                    <Toggle
                      checked={!!form.notify?.channelEmail}
                      onChange={(v) => patchNotify({ channelEmail: v })}
                      label="Gợi ý kênh thư điện tử"
                      hint="Hiển thị lựa chọn gửi thư khi đăng ký nhắc"
                    />
                    <Toggle
                      checked={!!form.notify?.channelZalo}
                      onChange={(v) => patchNotify({ channelZalo: v })}
                      label="Gợi ý kênh Zalo"
                      hint="Bật khi đã cấu hình kênh Zalo trên máy chủ"
                    />
                  </div>
                  <p className={styles.muted}>
                    Xem và gửi hàng đợi tại <Link to="/notifications">Nhắc giỗ (quản trị)</Link>.
                  </p>
                </div>
              ) : null}
            </section>

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
