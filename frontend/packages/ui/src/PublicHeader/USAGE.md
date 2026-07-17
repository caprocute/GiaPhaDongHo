# PublicHeader

Masthead chuẩn (portal + admin): utility bar + băng hồi văn + ấn triện + brand + nav strip có icon Lucide.

## Props

| Prop | Mô tả |
|------|--------|
| `brand` / `subtitle` | Tên dòng họ + phụ đề |
| `brandHref` | Link ấn/brand |
| `activeHref` | Path hiện tại để highlight menu |
| `navItems` | Menu hàng 2 (`href`, `label`, `icon?`, `forceActive?`) — mặc định menu portal |
| `cta` | CTA brand row; `null` để ẩn |
| `fluid` | Bỏ max-width 1280 (admin) |
| `sticky` | Sticky (portal) / tắt khi trong AppShell |
| `utilityLeft` / `utilityRight` / `endSlot` | Slot thanh tiện ích + auth |

Icon: **lucide-react** (`currentColor` → token màu text/active). Ấn tổ: `ClanSeal`.

## Mobile (≤960px)

- Nav desktop ẩn; hamburger → drawer + backdrop
- `Escape` / chọn link / backdrop → đóng

## Mapping

- Mockup: `instruction/mockups/giapha-ui-mockup.html` → `.utility` / `.masthead` / `.nav`
- TK-02: lucide-react + SVG hoa văn riêng
