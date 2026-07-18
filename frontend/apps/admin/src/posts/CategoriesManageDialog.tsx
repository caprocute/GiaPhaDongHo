import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, Dialog, EmptyState, FormField, Input, Textarea } from "@giapha/ui";
import {
  createCmsCategory,
  deleteCmsCategory,
  listCmsCategories,
  updateCmsCategory,
} from "../api/cmsApi";
import type { CmsCategoryDto } from "../api/cmsTypes";
import { ApiError } from "../api/http";
import { slugify } from "./postMappers";

type Props = {
  open: boolean;
  onClose: () => void;
  onChanged: (cats: CmsCategoryDto[]) => void;
};

type FormState = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  sortOrder: string;
  visibleOnNav: boolean;
};

function emptyForm(): FormState {
  return { name: "", slug: "", description: "", sortOrder: "100", visibleOnNav: true };
}

export function CategoriesManageDialog({ open, onClose, onChanged }: Props) {
  const { getAccessToken } = useAuth();
  const [rows, setRows] = useState<CmsCategoryDto[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      setError(null);
      try {
        const token = await getAccessToken();
        const cats = await listCmsCategories(token);
        if (!cancelled) {
          setRows(cats);
          setForm(emptyForm());
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Không tải được chuyên mục.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, getAccessToken]);

  function edit(c: CmsCategoryDto) {
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      sortOrder: String(c.sortOrder ?? 100),
      visibleOnNav: c.visibleOnNav !== false,
    });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const name = form.name.trim();
    const slug = (form.slug.trim() || slugify(name)).toLowerCase();
    if (!name || !slug) {
      setError("Nhập tên chuyên mục.");
      return;
    }
    setBusy(true);
    try {
      const token = await getAccessToken();
      const body: CmsCategoryDto = {
        id: form.id,
        name,
        slug,
        description: form.description.trim() || null,
        sortOrder: Number(form.sortOrder) || 100,
        visibleOnNav: form.visibleOnNav,
        layout: "article",
      };
      if (form.id != null) {
        await updateCmsCategory(form.id, body, token);
      } else {
        await createCmsCategory(body, token);
      }
      const cats = await listCmsCategories(token);
      setRows(cats);
      onChanged(cats);
      setForm(emptyForm());
    } catch (ex) {
      setError(ex instanceof ApiError ? ex.message : "Không lưu được chuyên mục.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Xóa chuyên mục này? Chỉ xóa được khi không còn bài gắn vào.")) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await deleteCmsCategory(id, token);
      const cats = await listCmsCategories(token);
      setRows(cats);
      onChanged(cats);
      if (form.id === id) setForm(emptyForm());
    } catch (ex) {
      setError(ex instanceof ApiError ? ex.message : "Không xóa được — có thể còn bài thuộc chuyên mục.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Quản lý chuyên mục"
      description="Mỗi chuyên mục tạo một mục tin trên cổng thông tin. Bật «Hiện trên cổng» để thấy chip lọc tại trang Tin tức."
      onClose={() => !busy && onClose()}
      size="lg"
      footer={
        <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
          Đóng
        </Button>
      }
    >
      <div className="admin-form">
        {error ? (
          <Alert title="Cần xử lý" variant="error">
            {error}
          </Alert>
        ) : null}

        <form className="admin-form" onSubmit={(e) => void save(e)} noValidate>
          <FormField label="Tên chuyên mục" required htmlFor="cat-name">
            <Input
              id="cat-name"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: f.id ? f.slug : slugify(e.target.value),
                }))
              }
              placeholder="Ví dụ: Thông báo"
            />
          </FormField>
          <FormField
            label="Mã đường dẫn"
            required
            hint="Chữ thường, gạch ngang — dùng để mở mục tin trên cổng"
            htmlFor="cat-slug"
          >
            <Input
              id="cat-slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="thong-bao"
            />
          </FormField>
          <FormField label="Mô tả ngắn (lead trang chuyên mục)" htmlFor="cat-desc">
            <Textarea
              id="cat-desc"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FormField>
          <div className="admin-form-grid">
            <FormField label="Thứ tự" htmlFor="cat-order">
              <Input
                id="cat-order"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                inputMode="numeric"
              />
            </FormField>
            <label className="sch-check-inline" style={{ alignSelf: "end", paddingBottom: 8 }}>
              <input
                type="checkbox"
                checked={form.visibleOnNav}
                onChange={(e) => setForm((f) => ({ ...f, visibleOnNav: e.target.checked }))}
              />
              <span>Hiện trên cổng (hub tin)</span>
            </label>
          </div>
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Button type="submit" disabled={busy}>
              {busy ? "Đang lưu…" : form.id ? "Cập nhật" : "Thêm chuyên mục"}
            </Button>
            {form.id != null ? (
              <Button type="button" variant="secondary" disabled={busy} onClick={() => setForm(emptyForm())}>
                Thêm mới
              </Button>
            ) : null}
          </div>
        </form>

        <h4 style={{ margin: "var(--spacing-lg) 0 var(--spacing-sm)" }}>Đã có</h4>
        {rows.length === 0 ? (
          <EmptyState title="Chưa có chuyên mục" description="Thêm chuyên mục đầu tiên bằng biểu mẫu trên." />
        ) : (
          <ul className="cms-cat-manage-list">
            {rows.map((c) => (
              <li key={c.id}>
                <div>
                  <strong>{c.name}</strong>
                  <span className="cms-cat-manage-meta">
                    {" "}
                    · {c.slug}
                    {c.visibleOnNav === false ? " · ẩn trên cổng" : ""}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button type="button" variant="secondary" onClick={() => edit(c)} disabled={busy}>
                    Sửa
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => c.id != null && void remove(c.id)}
                    disabled={busy}
                  >
                    Xóa
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
