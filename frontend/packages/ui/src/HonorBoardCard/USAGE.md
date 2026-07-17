# HonorBoardCard — Thẻ bảng vàng

> **Done 4 mảnh (TK-04):** ① Spec · ② Code · ③ Story · ④ Usage.

Thẻ vinh danh: **vành trống đồng + chim lạc**, halo radial mềm, tia sáng mask hình tròn, ruy băng foil — không nguyệt quế, không vàng neon.

## Props

| Prop | Mô tả |
|------|--------|
| `name` | Họ tên trên ruy băng |
| `detail` | Dòng phụ dưới ruy băng (thành tích / mô tả) |
| `imageUrl` | Ảnh chân dung (tuỳ chọn) |
| `emblem` | Chữ thay avatar (壽, 德, 學…) |
| `onDark` | Biến thể trên nền thẫm (tuỳ chọn) |

## Usage

```tsx
import { HonorBoardCard } from "@giapha/ui";

<HonorBoardCard name="Lê Thị Thùy Vy" detail="Học viên xuất sắc · ĐTH 9.2" emblem="學" />
```

## Mapping

- Mockup: `instruction/mockups/bang-vang-honor-card.html` (poster kem + trống đồng / chim lạc)
- Tokens: `--color-heritage-*`, `--color-surface-*`, `--font-display/body`
