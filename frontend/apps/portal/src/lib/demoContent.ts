import type { ApiAnniversary, ApiPerson, ApiPost } from "./types";

export const DEMO_PERSONS: ApiPerson[] = [
  {
    id: 1,
    code: "A1",
    fullName: "Hoàng Văn Tổ",
    gender: "M",
    lifeStatus: "deceased",
    generation: 1,
    lineagePath: "A1",
    deathSolar: "1900-01-15",
    biography: "Thủy tổ chi họ (demo R1.7).",
  },
  {
    id: 2,
    code: "A1-sp1",
    fullName: "Nguyễn Thị Tổ Mẫu",
    gender: "F",
    lifeStatus: "deceased",
    generation: 1,
    lineagePath: "A1-sp1",
  },
  {
    id: 3,
    code: "A2",
    fullName: "Hoàng Văn Trưởng",
    gender: "M",
    lifeStatus: "deceased",
    generation: 2,
    lineagePath: "A1/A2",
  },
  {
    id: 4,
    code: "A3",
    fullName: "Hoàng Văn Thứ",
    gender: "M",
    lifeStatus: "alive",
    generation: 2,
    lineagePath: "A1/A3",
    birthSolar: "1990-05-01",
    privacy: "members",
  },
];

export const DEMO_POSTS: ApiPost[] = [
  {
    slug: "gioi-thieu-dong-ho",
    title: "Giới thiệu dòng họ",
    summary: "Vài nét về lịch sử và truyền thống dòng họ.",
    bodyHtml: "<p>Dòng họ giữ gìn gia phả qua nhiều thế hệ — demo portal R1.7.</p>",
    publishedAt: "2026-01-15T08:00:00.000Z",
    authorName: "Ban biên tập",
    category: { slug: "tin-tuc", name: "Tin tức" },
  },
  {
    slug: "le-gio-to-2026",
    title: "Thông báo lễ giỗ Tổ 2026",
    summary: "Lịch trình và địa điểm tổ chức.",
    bodyHtml: "<p>Ban tổ chức kính mời bà con tham dự lễ giỗ Tổ (demo).</p>",
    publishedAt: "2026-03-01T02:00:00.000Z",
    authorName: "Ban tổ chức",
    category: { slug: "thong-bao", name: "Thông báo" },
  },
];

export function demoAnniversaries(lunarMonth: number): ApiAnniversary[] {
  return [
    {
      id: 1,
      lunarDay: 3,
      lunarMonth,
      person: { code: "A1", fullName: "Hoàng Văn Tổ" },
      note: "Giỗ Thủy tổ",
    },
    {
      id: 2,
      lunarDay: 15,
      lunarMonth,
      person: { code: "A2", fullName: "Hoàng Văn Trưởng" },
      canChi: "demo",
    },
  ];
}

export const DEMO_ALBUM = [
  {
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    alt: "Núi non — demo album",
    caption: "Phong cảnh quê hương (ảnh minh họa)",
  },
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    alt: "Hồ nước — demo album",
    caption: "Kỷ niệm họp họ (ảnh minh họa)",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    alt: "Rừng — demo album",
    caption: "Di sản sống (ảnh minh họa)",
  },
];
