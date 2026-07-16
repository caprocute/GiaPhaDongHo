export type PostStatus = "draft" | "published" | "archived";

export type PostRecord = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  bodyHtml: string;
  status: PostStatus;
  categorySlug?: string;
  authorName?: string;
  publishedAt?: string;
};
