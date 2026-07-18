import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@giapha/auth";
import { Alert, Button, FormField, Input, Select, Textarea } from "@giapha/ui";
import {
  createCmsPost,
  getCmsPost,
  listCmsCategories,
  updateCmsPost,
} from "../api/cmsApi";
import type { CmsCategoryDto } from "../api/cmsTypes";
import { getPhotoUrl } from "../api/mediaApi";
import { ApiError } from "../api/http";
import { MediaPickerDialog } from "../components/RichTextEditor/MediaPickerDialog";
import { RichTextEditor } from "../components/RichTextEditor/RichTextEditor";
import { fromCmsPost, slugify, toCmsPostDto } from "./postMappers";
import { postSchema, type PostSchemaInput } from "./postSchema";
import type { PostRecord } from "./types";

function portalBase(): string {
  return import.meta.env.VITE_PORTAL_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

function toFormValues(p?: PostRecord): PostSchemaInput {
  return {
    slug: p?.slug ?? "",
    title: p?.title ?? "",
    summary: p?.summary ?? "",
    bodyHtml: p?.bodyHtml ?? "",
    status: p?.status ?? "draft",
    categorySlug: p?.categorySlug ?? "",
    authorName: p?.authorName ?? "",
    coverObjectKey: p?.coverObjectKey ?? "",
  };
}

export function PostFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
  const isNew = !id || id === "new";

  const [existing, setExisting] = useState<PostRecord | undefined>();
  const [categories, setCategories] = useState<CmsCategoryDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [coverDisplayUrl, setCoverDisplayUrl] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PostSchemaInput>({
    resolver: zodResolver(postSchema),
    defaultValues: toFormValues(),
  });

  const watched = useWatch({ control });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadError(null);
      try {
        const token = await getAccessToken();
        const cats = await listCmsCategories(token);
        if (!cancelled) setCategories(cats);

        if (isNew) {
          if (!cancelled) {
            setExisting(undefined);
            reset(toFormValues());
            setCoverDisplayUrl("");
            setLoading(false);
          }
          return;
        }

        const numericId = Number(id);
        if (!Number.isFinite(numericId)) {
          if (!cancelled) {
            setLoadError("Mã bài viết không hợp lệ.");
            setLoading(false);
          }
          return;
        }

        const dto = await getCmsPost(numericId, token);
        const record = fromCmsPost(dto);
        if (!cancelled) {
          setExisting(record);
          reset(toFormValues(record));
          setCoverDisplayUrl(record.coverObjectKey ? getPhotoUrl(record.coverObjectKey) : "");
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof ApiError ? e.message : "Không tải được bài viết.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getAccessToken, id, isNew, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null);
    const slug = values.slug?.trim() || slugify(values.title) || `bai-${Date.now()}`;
    const categorySlug = values.categorySlug?.trim() || undefined;
    const category =
      categorySlug != null
        ? (categories.find((c) => c.slug === categorySlug) ?? null)
        : null;

    if (categorySlug && !category) {
      setSaveError(`Chuyên mục «${categorySlug}» chưa có — mở Quản lý chuyên mục trên danh sách bài.`);
      return;
    }

    const record: PostRecord = {
      id: isNew ? "" : existing!.id,
      slug,
      title: values.title.trim(),
      summary: values.summary?.trim() || undefined,
      bodyHtml: values.bodyHtml.trim(),
      status: values.status,
      categorySlug,
      authorName: values.authorName?.trim() || undefined,
      coverObjectKey: values.coverObjectKey?.trim() || undefined,
      publishedAt:
        values.status === "published"
          ? existing?.publishedAt ?? new Date().toISOString()
          : existing?.publishedAt,
    };

    try {
      const token = await getAccessToken();
      const dto = toCmsPostDto(record, category);
      if (isNew) {
        const { id: _omit, ...createBody } = dto;
        await createCmsPost(createBody, token);
      } else {
        await updateCmsPost(Number(existing!.id), { ...dto, id: Number(existing!.id) }, token);
      }
      navigate("/posts");
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Lưu bài viết thất bại.");
    }
  });

  if (loading) {
    return (
      <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
    );
  }

  if (loadError || (!isNew && !existing)) {
    return (
      <Alert title="Không tìm thấy bài viết" variant="error">
        {loadError ?? "Bài viết không tồn tại."}{" "}
        <Link to="/posts">Quay lại danh sách</Link>
      </Alert>
    );
  }

  const categoryOptions = [
    { value: "", label: "— Chọn chuyên mục —" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  const previewTitle = watched.title?.trim() || "Tiêu đề bài viết";
  const previewAuthor = watched.authorName?.trim() || "Ban biên tập";
  const previewCat =
    categories.find((c) => c.slug === watched.categorySlug)?.name ?? "Chưa chọn chuyên mục";
  const isPublished = watched.status === "published";
  const publicUrl =
    !isNew && existing?.slug
      ? `${portalBase()}/news/${encodeURIComponent(existing.slug)}`
      : null;

  return (
    <div className="admin-stack">
      <div className="form-page-hd">
        <div>
          <h1>{isNew ? "Viết bài mới" : `Sửa — ${existing!.title}`}</h1>
          <p>Soạn nội dung, chọn chuyên mục để hiện đúng mục trên cổng thông tin, xem trước rồi xuất bản.</p>
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-sm)", flexWrap: "wrap" }}>
          {publicUrl && isPublished ? (
            <a href={publicUrl} target="_blank" rel="noreferrer" className="admin-link-btn">
              Xem trên cổng ↗
            </a>
          ) : null}
          <Link to="/posts" className="admin-link-btn">
            ← Danh sách
          </Link>
        </div>
      </div>

      {categories.length === 0 ? (
        <Alert title="Chưa có chuyên mục" variant="info">
          Tạo chuyên mục tại danh sách bài («Quản lý chuyên mục») trước khi xuất bản lên cổng.
        </Alert>
      ) : null}

      {saveError ? (
        <Alert title="Không lưu được" variant="error">
          {saveError}
        </Alert>
      ) : null}

      <form className="post-form-layout" onSubmit={onSubmit}>
        <div className="post-form-main">
          <FormField label="Tiêu đề" required error={errors.title?.message}>
            <Input
              className="post-title-input"
              placeholder="Tiêu đề bài viết…"
              {...register("title")}
            />
          </FormField>
          <FormField
            label="Đường dẫn bài"
            hint="Để trống sẽ tạo từ tiêu đề · dùng trên cổng /news/…"
            error={errors.slug?.message}
          >
            <Input placeholder="gioi-thieu-dong-ho" {...register("slug")} />
          </FormField>
          <FormField label="Tóm tắt (sapo)" error={errors.summary?.message}>
            <Textarea rows={2} placeholder="Một đoạn dẫn ngắn trên danh sách tin…" {...register("summary")} />
          </FormField>

          <div className="post-editor-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "edit"}
              className={`post-editor-tab${tab === "edit" ? " on" : ""}`}
              onClick={() => setTab("edit")}
            >
              Soạn
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              className={`post-editor-tab${tab === "preview" ? " on" : ""}`}
              onClick={() => setTab("preview")}
            >
              Xem trước (cổng)
            </button>
          </div>

          {tab === "edit" ? (
            <FormField label="Nội dung" required error={errors.bodyHtml?.message}>
              <Controller
                name="bodyHtml"
                control={control}
                render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange} minHeight={440} />
                )}
              />
            </FormField>
          ) : (
            <div className="post-portal-preview">
              {!isPublished ? (
                <p className="post-preview-banner">Bản xem trước — chưa công bố trên cổng thông tin</p>
              ) : null}
              <p className="post-preview-cat">{previewCat}</p>
              <h2 className="post-preview-title">{previewTitle}</h2>
              <p className="post-preview-meta">{previewAuthor}</p>
              {coverDisplayUrl ? (
                <img className="post-preview-cover" src={coverDisplayUrl} alt="" />
              ) : null}
              {watched.summary?.trim() ? (
                <p className="post-preview-summary">{watched.summary}</p>
              ) : null}
              <div
                className="post-preview-prose"
                dangerouslySetInnerHTML={{ __html: watched.bodyHtml || "<p><em>Chưa có nội dung.</em></p>" }}
              />
            </div>
          )}
        </div>

        <aside className="post-form-side">
          <div className="post-side-card">
            <h2 className="form-section-title">Xuất bản</h2>
            <FormField label="Trạng thái" required error={errors.status?.message}>
              <Select
                options={[
                  { value: "draft", label: "Nháp" },
                  { value: "published", label: "Đã xuất bản" },
                  { value: "archived", label: "Lưu trữ" },
                ]}
                {...register("status")}
              />
            </FormField>
            <FormField
              label="Chuyên mục"
              required
              hint="Bắt buộc khi xuất bản — bài hiện trong mục tương ứng trên cổng"
              error={errors.categorySlug?.message}
            >
              <Select options={categoryOptions} {...register("categorySlug")} />
            </FormField>
            <FormField label="Bút danh" error={errors.authorName?.message}>
              <Input placeholder="Ban biên tập" {...register("authorName")} />
            </FormField>
            <div className="form-actions">
              <Button type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
                {isSubmitting ? "Đang lưu…" : isNew ? "Lưu bài" : "Lưu thay đổi"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/posts")}>
                Hủy
              </Button>
            </div>
          </div>

          <div className="post-side-card">
            <h2 className="form-section-title">Ảnh đại diện</h2>
            <input type="hidden" {...register("coverObjectKey")} />
            {coverDisplayUrl ? (
              <img className="post-cover-preview" src={coverDisplayUrl} alt="Ảnh đại diện" />
            ) : (
              <p className="post-cover-empty">Chưa chọn — lấy từ Thư viện</p>
            )}
            <div style={{ display: "flex", gap: "var(--spacing-xs)", marginTop: "var(--spacing-sm)" }}>
              <Button type="button" variant="secondary" onClick={() => setCoverPickerOpen(true)}>
                Chọn từ thư viện
              </Button>
              {coverDisplayUrl ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setValue("coverObjectKey", "");
                    setCoverDisplayUrl("");
                  }}
                >
                  Gỡ
                </Button>
              ) : null}
            </div>
          </div>
        </aside>
      </form>

      <MediaPickerDialog
        open={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onPick={(url, alt) => {
          // Lưu URL hiển thị; nếu là key MinIO thuần thì dùng làm coverObjectKey
          const keyGuess = url.includes("://") ? "" : url;
          if (keyGuess) {
            setValue("coverObjectKey", keyGuess);
            setCoverDisplayUrl(getPhotoUrl(keyGuess) || url);
          } else {
            // Presigned URL — giữ key rỗng nhưng preview bằng URL; lưu URL vào summary không đúng.
            // Dùng coverObjectKey để chứa objectKey nếu parse được từ path.
            try {
              const u = new URL(url);
              const path = u.pathname.replace(/^\//, "");
              setValue("coverObjectKey", path || url);
            } catch {
              setValue("coverObjectKey", url);
            }
            setCoverDisplayUrl(url);
          }
          void alt;
        }}
      />
    </div>
  );
}
