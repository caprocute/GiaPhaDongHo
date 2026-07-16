# PublicHeader

Masthead cổng công khai theo mockup **Di sản sống**: utility bar + băng hồi văn + ấn triện + brand dòng họ + nav.

## Props

| Prop | Mô tả |
|------|--------|
| `brand` | Tên dòng họ (mặc định: Họ Hoàng – Huỳnh) |
| `subtitle` | Địa danh |
| `activeHref` | Path hiện tại để highlight menu |
| `utilityLeft` / `utilityRight` | Slot thanh tiện ích |
| `endSlot` | Thường là nút đăng nhập OIDC |

## Mobile (≤960px)

- Nav desktop ẩn; nút hamburger mở drawer + backdrop
- `Escape` / chọn link / backdrop → đóng menu
- ≤640px: ẩn SĐT utility, rút gọn brand/subtitle

## Mapping

- Mockup: `instruction/mockups/giapha-ui-mockup.html` → `.utility` / `.masthead` / `.nav`
- Tokens: `--color-heritage-*`, `--pattern-meander`, `--font-display`
