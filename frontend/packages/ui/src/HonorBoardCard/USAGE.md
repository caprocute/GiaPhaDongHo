# HonorBoardCard — Thẻ bảng vàng

> **Done 4 mảnh (TK-04):** ① Spec · ② Code · ③ Story · ④ Usage.

Thẻ vinh danh trên nền kem: scene mây/núi trống đồng, **vòng chim lạc** quanh avatar, tia sáng tròn + glow trung tâm, ruy băng tên.

## Props

| Prop | Mô tả |
|------|--------|
| `name` | Họ tên trên ruy băng |
| `detail` | Dòng phụ dưới ruy băng (thành tích / mô tả) |
| `imageUrl` | Ảnh chân dung (tuỳ chọn) |
| `emblem` | Chữ thay avatar (壽, 德, 學…) |
| `onDark` | Biến thể mờ trên nền tối (tuỳ chọn) |

## Usage

```tsx
import { HonorBoardCard } from "@giapha/ui";

<HonorBoardCard name="Lê Thị Thùy Vy" detail="Học viên xuất sắc · ĐTH 9.2" emblem="學" />
```

## Mapping

- Mockup: `instruction/mockups/bang-vang-honor-card.html`
- Tham chiếu thẩm mỹ: poster kem + hoa văn trống đồng / chim lạc
- Tokens: `--color-heritage-*`, `--color-surface-*`, `--font-display/body`
