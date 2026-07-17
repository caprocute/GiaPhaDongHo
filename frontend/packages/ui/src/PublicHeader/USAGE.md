# PublicHeader

Masthead chuẩn (portal + admin): utility bar + băng hồi văn + ấn triện + brand · cùng component.

## Props

| Prop | Mô tả |
|------|--------|
| `brand` / `subtitle` | Mặc định «Họ Hoàng – Huỳnh» + địa danh |
| `brandHref` | Link ấn/brand |
| `activeHref` | Path hiện tại để highlight menu |
| `navItems` | Menu hàng 2 — mặc định menu portal; **`[]` ẩn tab** (admin) |
| `cta` | CTA brand row; `null` để ẩn |
| `fluid` | Bỏ max-width 1280 (admin full-bleed) |
| `sticky` | Sticky (portal) / tắt khi trong AppShell |
| `utilityLeft` | Mặc định SĐT · email |
| `utilityRight` | Mặc định `LunarUtilityLabel`; `null` để ẩn |
| `endSlot` | Auth (Đăng nhập / Đăng xuất) |

## Admin vs Portal

| | Portal | Admin |
|--|--------|-------|
| Nav tabs | Menu tính năng | `navItems={[]}` |
| CTA | Tra cứu phả đồ | Về cổng thông tin |
| Footer | `PublicFooter` | Cùng `PublicFooter` |

## Mapping

- Mockup: `instruction/mockups/giapha-ui-mockup.html` → `.utility` / `.masthead` / `.nav`
- TK-02: lucide-react + `ClanSeal`
