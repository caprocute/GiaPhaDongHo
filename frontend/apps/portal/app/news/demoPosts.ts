export type DemoPost = {
  slug: string;
  title: string;
  summary: string;
  bodyHtml: string;
  categorySlug: string;
  publishedAt: string;
  authorName: string;
};

/** Demo khi chưa nối BE — shape khớp CmsPostDTO public. */
export const DEMO_POSTS: DemoPost[] = [
  {
    slug: "gioi-thieu-dong-ho",
    title: "Giới thiệu dòng họ",
    summary: "Vài nét về lịch sử và truyền thống dòng họ.",
    bodyHtml:
      "<p>Dòng họ giữ gìn gia phả qua nhiều thế hệ — đây là bản demo portal R1.3.</p>",
    categorySlug: "tin-tuc",
    publishedAt: "2026-01-15T08:00:00.000Z",
    authorName: "Ban biên tập",
  },
  {
    slug: "le-gio-to-2026",
    title: "Thông báo lễ giỗ Tổ 2026",
    summary: "Lịch trình và địa điểm tổ chức.",
    bodyHtml: "<p>Ban tổ chức kính mời bà con tham dự lễ giỗ Tổ (demo).</p>",
    categorySlug: "thong-bao",
    publishedAt: "2026-03-01T02:00:00.000Z",
    authorName: "Ban tổ chức",
  },
];
