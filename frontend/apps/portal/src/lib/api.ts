import { API_BASE, TREE_SLUG } from "./config";
import type { ApiAnniversary, ApiCategory, ApiPerson, ApiPost } from "./types";

export type PageResult<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  /** 0-indexed page number (Spring convention). */
  number: number;
  size: number;
};

const DEFAULT_REVALIDATE = 30;

async function getJson<T>(path: string): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const init: any =
      typeof window === "undefined"
        ? { credentials: "omit", next: { revalidate: DEFAULT_REVALIDATE } }
        : { credentials: "omit" };
    const res = await fetch(`${API_BASE}${path}`, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Gọi endpoint trả về mảng với X-Total-Count header — chuẩn JHipster. */
async function getPage<T>(path: string, page: number, size: number): Promise<PageResult<T>> {
  const empty: PageResult<T> = { content: [], totalElements: 0, totalPages: 0, number: page, size };
  if (!API_BASE) return empty;
  try {
    const sep = path.includes("?") ? "&" : "?";
    const url = `${API_BASE}${path}${sep}page=${page}&size=${size}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const init: any =
      typeof window === "undefined"
        ? { credentials: "omit", next: { revalidate: DEFAULT_REVALIDATE } }
        : { credentials: "omit" };
    const res = await fetch(url, init);
    if (!res.ok) return empty;
    const content = (await res.json()) as T[];
    const totalElements = parseInt(res.headers.get("X-Total-Count") ?? "0", 10);
    const totalPages = Math.ceil(totalElements / size) || 1;
    return { content, totalElements, totalPages, number: page, size };
  } catch {
    return empty;
  }
}

export async function fetchPersonsPage(
  query: string | undefined,
  page: number,
  size = 20,
): Promise<PageResult<ApiPerson>> {
  const q = query?.trim() ? `&query=${encodeURIComponent(query.trim())}` : "";
  return getPage<ApiPerson>(
    `/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/persons?sort=fullName,asc${q}`,
    page,
    size,
  );
}

/** Fallback compat — lấy tất cả (SSR home). */
export async function fetchPersons(query?: string, size = 50): Promise<ApiPerson[]> {
  const q = query?.trim() ? `&query=${encodeURIComponent(query.trim())}` : "";
  return (
    (await getJson<ApiPerson[]>(
      `/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/persons?size=${size}${q}`,
    )) ?? []
  );
}

export async function fetchPerson(code: string): Promise<ApiPerson | null> {
  return getJson<ApiPerson>(
    `/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/persons/${encodeURIComponent(code)}`,
  );
}

export async function fetchPostsPage(
  page: number,
  size = 20,
  categorySlug?: string,
): Promise<PageResult<ApiPost>> {
  const cat = categorySlug?.trim()
    ? `&category=${encodeURIComponent(categorySlug.trim())}`
    : "";
  return getPage<ApiPost>(`/api/v1/posts?sort=publishedAt,desc${cat}`, page, size);
}

/** Fallback compat — SSR home. */
export async function fetchPosts(size = 20): Promise<ApiPost[]> {
  return (await getJson<ApiPost[]>(`/api/v1/posts?size=${size}&sort=publishedAt,desc`)) ?? [];
}

export async function fetchPost(slug: string): Promise<ApiPost | null> {
  return getJson<ApiPost>(`/api/v1/posts/${encodeURIComponent(slug)}`);
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  return (await getJson<ApiCategory[]>(`/api/v1/categories`)) ?? [];
}

export async function fetchCategory(slug: string): Promise<ApiCategory | null> {
  return getJson<ApiCategory>(`/api/v1/categories/${encodeURIComponent(slug)}`);
}

export async function fetchAnniversariesPage(
  lunarMonth: number | undefined,
  page: number,
  size = 20,
): Promise<PageResult<ApiAnniversary>> {
  const m = lunarMonth != null ? `lunarMonth=${lunarMonth}&` : "";
  return getPage<ApiAnniversary>(
    `/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/anniversaries?${m}sort=lunarDay,asc`,
    page,
    size,
  );
}

/** Fallback compat — SSR home. */
export async function fetchAnniversaries(lunarMonth?: number): Promise<ApiAnniversary[]> {
  const m = lunarMonth != null ? `?lunarMonth=${lunarMonth}` : "";
  return (
    (await getJson<ApiAnniversary[]>(
      `/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/anniversaries${m}`,
    )) ?? []
  );
}

export type GalleryPhoto = {
  id?: number;
  caption?: string | null;
  url?: string | null;
  thumbUrl?: string | null;
  albumId?: number | null;
};

export async function fetchGalleryPhotos(size = 60): Promise<GalleryPhoto[]> {
  return (
    (await getJson<GalleryPhoto[]>(`/api/v1/media/gallery/photos?size=${size}&sort=id,desc`)) ?? []
  );
}
