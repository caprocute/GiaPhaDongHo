import type { PostRecord } from "./types";

const STORAGE_KEY = "giapha.admin.posts.v1";

const SEED: PostRecord[] = [
  {
    id: "post-1",
    slug: "gioi-thieu-dong-ho",
    title: "Giới thiệu dòng họ",
    summary: "Vài nét về lịch sử và truyền thống dòng họ.",
    bodyHtml: "<p>Dòng họ giữ gìn gia phả qua nhiều thế hệ.</p>",
    status: "published",
    categorySlug: "tin-tuc",
    authorName: "Ban biên tập",
    publishedAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "post-2",
    slug: "le-gio-to-2026",
    title: "Thông báo lễ giỗ Tổ 2026",
    summary: "Lịch trình và địa điểm tổ chức.",
    bodyHtml: "<p>Ban tổ chức kính mời bà con tham dự lễ giỗ Tổ.</p>",
    status: "draft",
    categorySlug: "thong-bao",
    authorName: "Ban tổ chức",
  },
];

function readAll(): PostRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    const parsed = JSON.parse(raw) as PostRecord[];
    return Array.isArray(parsed) ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

function writeAll(rows: PostRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
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

export function listPosts(): PostRecord[] {
  return readAll().sort((a, b) => a.title.localeCompare(b.title, "vi"));
}

export function getPost(id: string): PostRecord | undefined {
  return readAll().find((p) => p.id === id);
}

export function upsertPost(record: PostRecord): PostRecord {
  const all = readAll();
  const idx = all.findIndex((p) => p.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.push(record);
  }
  writeAll(all);
  return record;
}

export function deletePost(id: string): void {
  writeAll(readAll().filter((p) => p.id !== id));
}
