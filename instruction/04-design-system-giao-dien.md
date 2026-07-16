# TK-04 — Design System & Định hướng giao diện

> Tuân thủ mô hình trong `Bao-cao-Chuan-hoa-giao-dien-thoi-dai-AI.pdf`: **source of truth = tokens + code**,
> Figma là môi trường khám phá; AI sinh UI từ structured context; mọi output qua verification gates.
> Quy trình vận hành chi tiết ở [11-quy-trinh-phat-trien-voi-ai.md](11-quy-trinh-phat-trien-voi-ai.md).

## 1. Định hướng thẩm mỹ: "Di sản sống" (Living Heritage)

Hai lớp cảm xúc trên cùng một hệ token:

| Khu vực | Tông | Đặc tả |
|---------|------|--------|
| **Khu Gia phả** (phả đồ, hồ sơ, ngày giỗ) | Trang nghiêm — truyền thống | Nền kem giấy dó, son đỏ `#8B2E22`, vàng nghệ `#C99B2F`, khung viền câu đối, hoa văn rồng/mây SVG mờ, serif hiển thị |
| **Khu Cổng thông tin** (tin tức, sự kiện, quỹ) | Hiện đại — biên tập (editorial) | Trắng/đen than, accent son đỏ, grid thoáng, ảnh lớn, card bo 16px |

**Khoảnh khắc chữ ký (signature moments)** — tạo ấn tượng ngay từ đầu (yêu cầu 2):
1. **Hero trang chủ**: phả đồ dạng constellation vẽ dần bằng SVG stroke animation (prefers-reduced-motion: tắt), 4 counter thống kê đếm tăng, CTA "Tìm tổ tiên của bạn".
2. **Phả đồ toàn màn hình**: canvas **React Flow** — zoom/pan mượt, minimap góc, `fitView` animation "bay" tới node khi đổi root, chế độ "khung ấn phẩm" bật/tắt như bản cũ (chi tiết §7).
3. **Trang hồ sơ người**: layout "bài vị số" — ảnh chân dung duotone, năm sinh–mất can chi, dòng thời gian cuộc đời.
4. **Ngày giỗ**: widget tờ lịch âm bóc, hôm nay có giỗ thì portal treo dải băng đỏ trang trọng.
5. **Dark mode** toàn hệ (token 2 mode), Lunar New Year theme switch (skin Tết tự bật theo lịch âm — token layer, không sửa code).

## 2. Tokens — nguồn chân lý duy nhất (PDF §3.1)

```
design-tokens/
├── primitive/color.tokens.json      # son-500, nghe-400, ink-900, paper-50...
├── semantic/color.tokens.json      # color.action.primary-bg → {son-600}
├── semantic/heritage.tokens.json   # color.heritage.frame, pattern.opacity...
├── typography.tokens.json          # font.display=Noto Serif; font.body=Be Vietnam Pro
├── spacing.tokens.json / radius / shadow / motion.tokens.json
└── modes/{light,dark,tet}.tokens.json
```

- Chuẩn **W3C DTCG 2025.10**; build bằng **Style Dictionary trong CI** → `packages/tokens` xuất: CSS variables, Tailwind v4 `@theme`, TS types.
- Cấm hardcode tuyệt đối: Gate B lint chặn hex/px trần (stylelint `color-no-hex`, ESLint rule custom + `declaration-property-value-allowed-list` như PDF §3.4).
- 2 tầng: primitive → semantic; component chỉ dùng semantic.
- Nếu dùng Figma: Figma Variables sync 2 chiều qua Tokens Studio (PDF GĐ1) — Figma là môi trường khám phá, không phải chân lý.

## 3. Thư viện component (`packages/ui`) — "SD code" theo PDF §3.2

**20 component ưu tiên (quy tắc Pareto — PDF khuyến nghị 1):**

`Button, Input/FormField, Select, DataTable, Card, Dialog/Sheet, Tabs, Badge/Tag, Avatar, Breadcrumb, Pagination, Toast, EmptyState, StatCounter, LunarDateBadge (ngày âm), PersonNodeCard (node phả đồ), TimelineItem, MediaLightbox, RichTextRenderer, HeritageFrame (khung ấn phẩm)`

Định nghĩa **"Done" 4 mảnh** cho mỗi component (PDF §6.1): ① spec/Figma chuẩn (nếu có Figma) ② code đủ states/responsive/keyboard ③ Storybook story phủ mọi variant (tài liệu cho AI đọc — không bỏ qua) ④ mapping (Code Connect nếu dùng Figma / MDX usage doc nếu không).

- Base: shadcn/ui (copy-in source, LLM đọc được) + Tailwind v4; đổi token là đổi cả 2 app.
- **Registry nội bộ kiểu shadcn**: `pnpm ui:add person-node-card` kéo component + token + story + rules vào app — một nguồn phân phối (PDF §2.2).
- Storybook 8 + **Storybook MCP**: AI agent query props/stories thật, hết "bịa" component (PDF §3.2).
- A11y: mọi component qua axe trong story test; focus ring token hóa; touch target ≥ 44px.

## 4. Phân tầng fidelity khi làm màn hình (PDF §3.3)

| Loại màn hình | Cách làm |
|---------------|----------|
| CRUD/danh sách/form CRM (~70% khối lượng) | **Không hi-fi Figma** — wireframe + spec nghiệp vụ → AI compose từ `packages/ui` → review trên staging |
| Màn hình pattern mới / trải nghiệm lớn (hero, phả đồ canvas, trang hồ sơ, sách PDF) | Hi-fi trên Figma trước (design là search — Karri Saarinen), rồi grounded generation |

## 5. Chuẩn giao diện bắt buộc

1. **Responsive**: mobile-first; phả đồ trên mobile = pan/zoom + danh sách thay thế; bảng → card stack.
2. **A11y WCAG 2.2 AA**: Gate D axe scan; kiểm tra tương phản son đỏ/vàng nghệ trên nền kem (đã chọn shade đạt 4.5:1).
3. **i18n**: vi mặc định, khung `next-intl`/`react-i18next` sẵn cho en; ngày âm lịch là first-class format.
4. **Hiệu năng**: LCP < 2.5s 4G; ảnh qua imgproxy (AVIF, blurhash placeholder); font subset tiếng Việt self-host.
5. **SEO Portal**: SSR + metadata, OG image động (ảnh thẻ người/bài viết), JSON-LD (`Person`, `Article`), sitemap, RSS parity bản cũ.
6. **Motion**: framer-motion, chuẩn duration/easing bằng token `motion.*`; tôn trọng reduced-motion.

## 6. Cấu trúc màn hình Portal (IA)

```
/                       — trang chủ widget-based (block registry TK-01 §3)
/gia-pha                — danh bạ gia phả (tỉnh/thành)
/gia-pha/{slug}         — thông tin chung + xuất ấn phẩm
/gia-pha/{slug}/pha-do  — canvas phả đồ (chart | tree | quạt)
/gia-pha/{slug}/nguoi/{code} — hồ sơ "bài vị số"
/gia-pha/{slug}/ngay-gio — bảng giỗ, lọc tháng âm
/tin-tuc/{category}/{slug} — bài viết
/su-kien, /cong-duc, /album, /tu-lieu, /tim-kiem, /lien-he
```

Khu admin (SPA riêng) đặc tả tại [07-crm-quan-tri-hien-dai.md](07-crm-quan-tri-hien-dai.md).

## 7. Đặc tả phả đồ trên React Flow (`packages/tree-viz`)

**Kiến trúc hybrid** (ADR): React Flow chỉ là tầng render/tương tác; **vị trí node do layout engine riêng tính**
(React Flow không có layout). Pipeline: `API /chart JSON → build graph (person + union node ảo) →
layout (d3-dag/elkjs + luật: vợ chồng kề nhau theo thứ tự hôn phối, con theo order_no, hàng ngang = đời) →
nodes[]/edges[] → <ReactFlow>`.

| Thành phần | Đặc tả thẩm mỹ |
|-----------|----------------|
| `PersonNode` (custom node) | React component thuần: khung "thẻ bài vị" HeritageFrame, ảnh duotone son đỏ, tên (serif) + can chi, badge đời, viền đỏ khi là root, hover nâng bóng + hiện quick actions; tất cả bằng semantic token |
| `UnionEdge` (custom edge) | Đường huyết thống bezier màu `color.heritage.bloodline`; nhánh đang chọn có animated dash "chảy"; đường hôn phối kiểu song song mảnh |
| Hàng đời | Background layer: dải "Đời N" chữ triện mờ + đường gióng ngang mảnh |
| Minimap | Node tô theo giới tính/tình trạng, khung viewport son đỏ |
| Tương tác | Click node → panel hồ sơ trượt; double-click → re-root với `fitView({duration: 800})`; collapse nhánh; phím tắt ←→↑↓ đi theo quan hệ |
| Hiệu năng | `onlyRenderVisibleElements`, node memo hóa, giới hạn depth mặc định (parity bản cũ "43 người vừa khổ") + "Xem sâu hơn" |
| Export | Màn hình: `html-to-image` (PNG/SVG); ấn phẩm: pdf-render service render route in riêng (print CSS) — không phụ thuộc canvas client |

## 8. Cam kết chất lượng thẩm mỹ (Definition of Beautiful — gate review thiết kế)

Checklist bắt buộc trước khi màn hình được nhận (designer review trên staging):
1. **100% giá trị từ token** — không màu/khoảng cách lạc hệ (Gate B đã chặn bằng máy).
2. **Nhịp không gian 4pt**, tối đa 2 cấp bóng đổ, radius thống nhất theo token.
3. **Chữ**: thang type rõ ràng (display serif / body sans), leading tiếng Việt đủ dấu không cắt, tối đa 72ch/dòng.
4. **Chuyển động có chủ đích**: mọi thay đổi trạng thái có transition (150–300ms token `motion.*`); không animation trang trí vô nghĩa; tôn trọng reduced-motion.
5. **Ảnh**: luôn có blurhash placeholder, không layout shift (CLS < 0.1).
6. **Trạng thái đầy đủ**: empty/loading (skeleton)/error đẹp ngang trạng thái thành công — EmptyState có minh họa hoa văn riêng.
7. **Dark mode + skin Tết** không phải afterthought: review cả 3 mode trước khi merge.
8. Màn hình pattern mới phải qua **khám phá hi-fi Figma** trước (PDF §2.3 — "design là search"), không để AI compose thẳng.
