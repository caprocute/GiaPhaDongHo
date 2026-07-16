import { useEffect, useMemo, type CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, Button, FormField, Input, Select, Textarea } from "@giapha/ui";
import { postSchema, type PostSchemaInput } from "./postSchema";
import { getPost, listPosts, slugify, upsertPost } from "./postStore";
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
  const isNew = !id || id === "new";
  const existing = useMemo(() => (isNew ? undefined : getPost(id)), [id, isNew]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostSchemaInput>({
    resolver: zodResolver(postSchema),
    defaultValues: toFormValues(existing),
  });

  useEffect(() => {
    reset(toFormValues(existing));
  }, [existing, reset]);

  const onSubmit = handleSubmit((values) => {
    const slug =
      values.slug?.trim() ||
      slugify(values.title) ||
      `bai-${listPosts().length + 1}`;
    const record: PostRecord = {
      id: isNew ? `post-${crypto.randomUUID()}` : existing!.id,
      slug,
      title: values.title.trim(),
      summary: values.summary?.trim() || undefined,
      bodyHtml: values.bodyHtml.trim(),
      status: values.status,
      categorySlug: values.categorySlug?.trim() || undefined,
      authorName: values.authorName?.trim() || undefined,
      publishedAt:
        values.status === "published"
          ? existing?.publishedAt ?? new Date().toISOString()
          : existing?.publishedAt,
    };
    upsertPost(record);
    navigate("/posts");
  });

  if (!isNew && !existing) {
    return (
      <Alert title="Không tìm thấy bài viết" variant="error">
        <Link to="/posts">Quay lại danh sách</Link>
      </Alert>
    );
  }

  const grid: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "var(--spacing-md)",
    maxWidth: 880,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--spacing-md)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>
          {isNew ? "Viết bài mới" : `Sửa — ${existing!.title}`}
        </h1>
        <Link to="/posts" style={{ fontFamily: "var(--font-body)" }}>
          ← Danh sách
        </Link>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
        <div style={grid}>
          <FormField label="Tiêu đề" required error={errors.title?.message}>
            <Input {...register("title")} />
          </FormField>
          <FormField label="Slug" hint="Để trống sẽ tạo từ tiêu đề" error={errors.slug?.message}>
            <Input placeholder="gioi-thieu-dong-ho" {...register("slug")} />
          </FormField>
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
          <FormField label="Chuyên mục (slug)" error={errors.categorySlug?.message}>
            <Input placeholder="tin-tuc" {...register("categorySlug")} />
          </FormField>
          <FormField label="Tác giả" error={errors.authorName?.message}>
            <Input {...register("authorName")} />
          </FormField>
        </div>
        <FormField label="Tóm tắt" error={errors.summary?.message}>
          <Textarea rows={2} {...register("summary")} />
        </FormField>
        <FormField
          label="Nội dung (HTML)"
          required
          hint="TipTap sẽ thay Textarea ở phase UI sau — TK-13 R1.3"
          error={errors.bodyHtml?.message}
        >
          <Textarea rows={10} {...register("bodyHtml")} />
        </FormField>
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <Button type="submit" disabled={isSubmitting}>
            Lưu
          </Button>
          <Link to="/posts">
            <Button type="button" variant="secondary">
              Hủy
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
