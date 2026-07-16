# Badge — Nhãn trạng thái

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Badge.tsx` · ③ Story `Badge.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Trạng thái ngắn: sống/mất, draft/published. |
| **Khi không** | Không nhồi đoạn văn dài vào Badge. |
| **Variants / API** | tone |
| **A11y** | Không chỉ dựa vào màu — kèm text. |

## ④ Usage

```tsx
import { Badge } from "@giapha/ui";

<Badge tone="success">Đã duyệt</Badge>
```

### Tokens (chỉ semantic)

`--color-heritage-accent`, `--color-text-*`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Badge` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Badge (Code Connect phase sau) |
| Import | `@giapha/ui` → `Badge` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
