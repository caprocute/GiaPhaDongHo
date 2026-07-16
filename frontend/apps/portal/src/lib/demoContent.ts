import type { ApiAnniversary, ApiPerson, ApiPost } from "./types";

/** Nội dung demo khớp mockup Di sản sống — Họ Hoàng thôn Trung Bính */
export const DEMO_PERSONS: ApiPerson[] = [
  {
    id: 1,
    code: "A7",
    fullName: "Hoàng Văn Thành",
    gender: "M",
    lifeStatus: "deceased",
    generation: 5,
    lineagePath: "A1/A7",
    deathSolar: "1850-07-14",
    biography: "Ông tổ đời thứ năm, người dựng nếp nhà võ học.",
  },
  {
    id: 2,
    code: "A7-sp1",
    fullName: "Phạm Thị Soạn",
    gender: "F",
    lifeStatus: "deceased",
    generation: 5,
    lineagePath: "A1/A7-sp1",
  },
  {
    id: 3,
    code: "A22",
    fullName: "Hoàng Văn Thạch",
    gender: "M",
    lifeStatus: "deceased",
    generation: 6,
    lineagePath: "A1/A7/A22",
  },
  {
    id: 4,
    code: "A55",
    fullName: "Hoàng Liệu",
    gender: "M",
    lifeStatus: "alive",
    generation: 8,
    lineagePath: "A1/A7/A22/A55",
    birthSolar: "1984-05-01",
    privacy: "members",
  },
];

export const DEMO_POSTS: ApiPost[] = [
  {
    slug: "ton-tao-lang-mo-thuy-to",
    title: "Khởi công tôn tạo, nâng cấp lăng mộ Thủy tổ đời thứ nhất",
    summary: "Ban biên tập ghi nhận khởi công tôn tạo lăng mộ Thủy tổ — hoạt động dòng họ.",
    bodyHtml:
      "<p>Con cháu họ Hoàng – Huỳnh thôn Trung Bính khởi công tôn tạo, nâng cấp lăng mộ Thủy tổ đời thứ nhất, giữ gìn hương hỏa tông tộc.</p>",
    publishedAt: "2026-06-23T08:00:00.000Z",
    authorName: "Ban biên tập",
    viewCount: 120,
    category: { slug: "hoat-dong", name: "Hoạt động dòng họ" },
  },
  {
    slug: "trung-tu-lang-mo-huynh-con",
    title: "Trùng tu lăng mộ Cụ Thượng thư Huỳnh Côn: tâm hương hướng về cội nguồn",
    summary: "Công trình trùng tu lăng mộ gắn liền với lịch sử dòng tộc.",
    bodyHtml: "<p>Tâm hương hướng về cội nguồn — công đức trùng tu lăng mộ Cụ Thượng thư Huỳnh Côn.</p>",
    publishedAt: "2025-12-04T02:00:00.000Z",
    authorName: "Ban biên tập",
    viewCount: 252,
    category: { slug: "hoat-dong", name: "Hoạt động dòng họ" },
  },
  {
    slug: "kien-toan-to-chuc-nhiem-ky",
    title: "Nhánh – Chi – Hội đồng gia tộc: kiện toàn tổ chức nhiệm kỳ mới",
    summary: "Kiện toàn tổ chức Hội đồng gia tộc nhiệm kỳ mới.",
    bodyHtml: "<p>Hội đồng gia tộc kiện toàn tổ chức theo nhánh – chi, nhiệm kỳ mới.</p>",
    publishedAt: "2025-11-16T02:00:00.000Z",
    authorName: "Hội đồng gia tộc",
    viewCount: 270,
    category: { slug: "thong-bao", name: "Thông báo" },
  },
  {
    slug: "le-nghi-huong-hoa",
    title: "Lễ nghi – Hương hỏa – Ngày giỗ truyền thống của dòng họ",
    summary: "Giữ gìn lễ nghi hương hỏa và ngày giỗ truyền thống.",
    bodyHtml: "<p>Truyền thống lễ nghi, hương hỏa và ngày giỗ của dòng họ Hoàng – Huỳnh.</p>",
    publishedAt: "2025-11-16T03:00:00.000Z",
    authorName: "Ban văn hóa",
    viewCount: 366,
    category: { slug: "van-hoa", name: "Văn hóa" },
  },
  {
    slug: "nha-van-bao-ninh",
    title: 'Nhà văn Bảo Ninh — tác giả kiệt tác "Nỗi buồn chiến tranh"',
    summary: "Gương sáng văn hóa của dòng tộc.",
    bodyHtml: "<p>Gương sáng văn hóa gắn với dòng họ — nhà văn Bảo Ninh.</p>",
    publishedAt: "2025-11-17T02:00:00.000Z",
    authorName: "Ban biên tập",
    viewCount: 316,
    category: { slug: "guong-sang", name: "Gương sáng" },
  },
];

export function demoAnniversaries(lunarMonth: number): ApiAnniversary[] {
  return [
    {
      id: 1,
      lunarDay: 4,
      lunarMonth,
      person: { code: "GQ-D", fullName: "Ông Hoàng Quang Du" },
      note: "Tháng này",
    },
    {
      id: 2,
      lunarDay: 6,
      lunarMonth,
      person: { code: "LH-D", fullName: "Bà Lê Thị Lệ Hà" },
      note: "Tháng này",
    },
    {
      id: 3,
      lunarDay: 8,
      lunarMonth,
      person: { code: "NTS", fullName: "Ông Nguyễn Trường Sơn" },
      note: "Tháng này",
    },
    {
      id: 4,
      lunarDay: 12,
      lunarMonth,
      person: { code: "HDH", fullName: "Ông Hoàng Đại Hạo" },
      note: "Tháng này",
    },
    {
      id: 5,
      lunarDay: 20,
      lunarMonth,
      person: { code: "HKT", fullName: "Ông Hoàng Khắc Thuế" },
      note: "Tháng này",
    },
    {
      id: 6,
      lunarDay: 3,
      lunarMonth: lunarMonth === 12 ? 1 : lunarMonth + 1,
      person: { code: "NVN", fullName: "Ông Nguyễn Văn Ninh" },
      note: "Tháng sau",
    },
  ];
}

export const DEMO_STATS = [
  { value: "1.586", label: "Thành viên" },
  { value: "13", label: "Đời" },
  { value: "769", label: "Nam" },
  { value: "817", label: "Nữ" },
] as const;

export const DEMO_CONG_DUC = [
  { medal: "壽", name: "Ông Hoàng Văn A", desc: "Hiến 200m² đất xây nhà thờ họ" },
  { medal: "德", name: "Bà Hoàng Thị B", desc: "Tài trợ quỹ khuyến học dòng họ" },
  { medal: "心", name: "Ông Hoàng Văn C", desc: "Sưu tầm, biên soạn gia phả 13 đời" },
] as const;

export const DEMO_ALBUM = [
  {
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    alt: "Phong cảnh quê hương",
    caption: "Phong cảnh quê hương (ảnh minh họa)",
  },
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    alt: "Kỷ niệm họp họ",
    caption: "Kỷ niệm họp họ (ảnh minh họa)",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    alt: "Di sản sống",
    caption: "Di sản sống (ảnh minh họa)",
  },
];
