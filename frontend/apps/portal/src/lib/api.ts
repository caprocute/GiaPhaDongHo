import { API_BASE, TREE_SLUG } from "./config";
import type { ApiAnniversary, ApiPerson, ApiPost } from "./types";

async function getJson<T>(path: string): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const init: RequestInit =
      typeof window === "undefined"
        ? { credentials: "omit", next: { revalidate: 30 } }
        : { credentials: "omit" };
    const res = await fetch(`${API_BASE}${path}`, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPersons(query?: string, size = 50): Promise<ApiPerson[]> {
  const q = query?.trim() ? `&query=${encodeURIComponent(query.trim())}` : "";
  return (
    (await getJson<ApiPerson[]>(`/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/persons?size=${size}${q}`)) ?? []
  );
}

export async function fetchPerson(code: string): Promise<ApiPerson | null> {
  return getJson<ApiPerson>(
    `/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/persons/${encodeURIComponent(code)}`,
  );
}

export async function fetchPosts(size = 20): Promise<ApiPost[]> {
  return (await getJson<ApiPost[]>(`/api/v1/posts?size=${size}&sort=publishedAt,desc`)) ?? [];
}

export async function fetchPost(slug: string): Promise<ApiPost | null> {
  return getJson<ApiPost>(`/api/v1/posts/${encodeURIComponent(slug)}`);
}

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

/** Ảnh từ thư viện quản trị (MinIO) — đồng bộ portal ↔ admin. */
export async function fetchGalleryPhotos(size = 60): Promise<GalleryPhoto[]> {
  return (
    (await getJson<GalleryPhoto[]>(`/api/v1/media/gallery/photos?size=${size}&sort=id,desc`)) ?? []
  );
}
