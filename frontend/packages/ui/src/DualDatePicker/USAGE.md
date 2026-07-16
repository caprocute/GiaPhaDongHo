# DualDatePicker — Chọn ngày dương + âm

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `DualDatePicker.tsx` · ③ Story `DualDatePicker.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Ngày sinh/mất/giỗ — bắt buộc lịch kép (TK-03). |
| **Khi không** | Không tự tính âm–dương ngoài `@giapha/lunar` / DualDatePicker. |
| **Variants / API** | solar ↔ lunar, leap |
| **A11y** | Hai chế độ rõ ràng; thông báo tháng nhuận. |

## ④ Usage

```tsx
import { DualDatePicker } from "@giapha/ui";

<DualDatePicker value={v} onChange={setV} />
```

### Tokens (chỉ semantic)

`--color-heritage-*`, `--font-display` (nhãn)

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `DualDatePicker` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/DualDatePicker (Code Connect phase sau) |
| Import | `@giapha/ui` → `DualDatePicker` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
