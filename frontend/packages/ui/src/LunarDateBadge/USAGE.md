# LunarDateBadge — Huy hiệu ngày âm

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `LunarDateBadge.tsx` · ③ Story `LunarDateBadge.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Hiển thị ngày giỗ/âm lịch đã quy đổi. |
| **Khi không** | Không tự format ngoài `@giapha/lunar`. |
| **Variants / API** | day/month/year/leap |
| **A11y** | Text đủ nghĩa kèm can chi nếu có. |

## ④ Usage

```tsx
import { LunarDateBadge } from "@giapha/ui";

<LunarDateBadge day={11} month={6} year={2024} />
```

### Tokens (chỉ semantic)

`--color-heritage-accent`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `LunarDateBadge` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/LunarDateBadge (Code Connect phase sau) |
| Import | `@giapha/ui` → `LunarDateBadge` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
