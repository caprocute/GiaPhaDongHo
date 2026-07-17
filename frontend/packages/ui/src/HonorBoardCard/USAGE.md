# HonorBoardCard — Thẻ bảng vàng

> **Done 4 mảnh (TK-04):** ① Spec · ② Code · ③ Story · ④ Usage.

Thẻ vinh danh kiểu nguyệt quế + ruy băng (tham chiếu layout bảng vàng), màu **heritage / foil / son** — không dùng vàng neon.

## Props

| Prop | Mô tả |
|------|--------|
| `name` | Họ tên trên ruy băng |
| `detail` | Dòng phụ dưới ruy băng (thành tích / mô tả) |
| `imageUrl` | Ảnh chân dung (tuỳ chọn) |
| `emblem` | Chữ thay avatar (壽, 德, 學…) |
| `onDark` | Biến thể trên nền son thẫm (home công đức) |

## Usage

```tsx
import { HonorBoardCard } from "@giapha/ui";

<HonorBoardCard name="Lê Thị Thùy Vy" detail="Học viên xuất sắc · ĐTH 9.2" emblem="學" />
```

## Mapping

- Mockup tinh thần: khối «Bảng vàng công đức» + layout laurel/ribbon
- Tokens: `--color-heritage-*`, `--color-surface-*`, `--font-display/body`
