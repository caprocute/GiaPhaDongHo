export type CmsCategoryDto = {
  id?: number;
  slug: string;
  name: string;
  layout?: string | null;
};

export type CmsPostDto = {
  id?: number;
  slug: string;
  title: string;
  summary?: string | null;
  bodyHtml?: string | null;
  status?: string | null;
  publishedAt?: string | null;
  viewCount?: number | null;
  authorName?: string | null;
  category?: CmsCategoryDto | null;
};

export type CmsCommentDto = {
  id?: number;
  authorName?: string | null;
  body?: string | null;
  status?: string | null;
  createdAt?: string | null;
  post?: Pick<CmsPostDto, "id" | "slug" | "title"> | null;
};
