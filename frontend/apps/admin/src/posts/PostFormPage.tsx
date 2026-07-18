import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { ApiError } from "../api/http";
import { RichTextEditor } from "../components/RichTextEditor/RichTextEditor";
import { fromCmsPost, slugify, toCmsPostDto } from "./postMappers";
import { postSchema, type PostSchemaInput } from "./postSchema";
import type { PostRecord } from "./types";

function toFormValues(p?: PostRecord): PostSchemaInput {
  return {
    slug: p?.slug ?? "",
    title: p?.title ?? "",
    summary: p?.summary ?? "",
    bodyHtml: p?.bodyHtml ?? "",
    status: p?.status ?? "draft",
    categorySlug: p?.categorySlug ?? "",
    authorName: p?.authorName ?? "",
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

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostSchemaInput>({
    resolver: zodResolver(postSchema),
    defaultValues: toFormValues(),
  });

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
            setLoading(false);
          }
          return;
        }

        const numericId = Number(id);
        if (!Number.isFinite(numericId)) {
          if (!cancelled) {
            setLoadError("ID bài viết không hợp lệ.");
            setLoading(false);
          }
          return;
        }

        const dto = await getCmsPost(numericId, token);
        const record = fromCmsPost(dto);
        if (!cancelled) {
          setExisting(record);
          reset(toFormValues(record));
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
      setSaveError(
        `Chuyên mục «${categorySlug}» chưa có trên API. Tạo category trước hoặc bỏ trống.`,
      );
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
    { value: "", label: "— Không chọn —" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <div className="admin-stack">
      <div className="form-page-hd">
        <div>
          <h1>{isNew ? "Viết bài mới" : `Sửa — ${existing!.title}`}</h1>
          <p>Soạn nội dung bằng trình soạn thảo, chọn chuyên mục và trạng thái xuất bản.</p>
        </div>
        <Link to="/posts" className="admin-link-btn">
          ← Danh sách
        </Link>
      </div>

      {saveError ? (
        <Alert title="Lỗi lưu" variant="error">
          {saveError}
        </Alert>
      ) : null}

      <form className="post-form-layout" onSubmit={onSubmit}>
        <div className="post-form-main">
          <FormField label="Tiêu đề" required error={errors.title?.message}>
            <Input className="post-title-input" placeholder="Tiêu đề bài viết…" {...register("title")} />
          </FormField>
          <FormField label="Đường dẫn" hint="Để trống sẽ tạo từ tiêu đề" error={errors.slug?.message}>
            <Input placeholder="gioi-thieu-dong-ho" {...register("slug")} />
          </FormField>
          <FormField label="Tóm tắt" error={errors.summary?.message}>
            <Textarea rows={2} {...register("summary")} />
          </FormField>
          <FormField label="Nội dung" required error={errors.bodyHtml?.message}>
            <Controller
              name="bodyHtml"
              control={control}
              render={({ field }) => (
                <RichTextEditor value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
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
            <FormField label="Chuyên mục" error={errors.categorySlug?.message}>
              <Select options={categoryOptions} {...register("categorySlug")} />
            </FormField>
            <FormField label="Tác giả" error={errors.authorName?.message}>
              <Input {...register("authorName")} />
            </FormField>
            <div className="form-actions">
              <Button type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
                {isSubmitting ? "Đang lưu…" : isNew ? "Đăng bài" : "Lưu thay đổi"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/posts")}>
                Hủy
              </Button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
