import type { CmsCategoryDto, CmsPostDto } from "../api/cmsTypes";
import type { PostRecord, PostStatus } from "./types";

const STATUSES: PostStatus[] = ["draft", "published", "archived"];

function asStatus(raw: string | null | undefined): PostStatus {
  const s = (raw ?? "draft").toLowerCase();
  return (STATUSES.includes(s as PostStatus) ? s : "draft") as PostStatus;
}

export function fromCmsPost(dto: CmsPostDto): PostRecord {
  return {
    id: String(dto.id ?? ""),
    slug: dto.slug,
    title: dto.title,
    summary: dto.summary ?? undefined,
    bodyHtml: dto.bodyHtml ?? "",
    status: asStatus(dto.status),
    categorySlug: dto.category?.slug ?? undefined,
    authorName: dto.authorName ?? undefined,
    publishedAt: dto.publishedAt ?? undefined,
  };
}

export function toCmsPostDto(
  record: PostRecord,
  category: CmsCategoryDto | null | undefined,
): CmsPostDto {
  const id = record.id ? Number(record.id) : undefined;
  return {
    id: id != null && Number.isFinite(id) ? id : undefined,
    slug: record.slug,
    title: record.title,
    summary: record.summary ?? null,
    bodyHtml: record.bodyHtml,
    status: record.status,
    authorName: record.authorName ?? null,
    publishedAt: record.publishedAt ?? null,
    category: category ?? null,
  };
}

export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
