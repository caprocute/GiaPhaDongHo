# Skeleton — Placeholder tải

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Skeleton.tsx` · ③ Story `Skeleton.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Loading list/card trước khi có data. |
| **Khi không** | Không dùng làm empty state — dùng EmptyState. |
| **Variants / API** | width/height |
| **A11y** | aria-hidden trên decorative skeleton. |

## ④ Usage

```tsx
import { Skeleton } from "@giapha/ui";

<Skeleton style={{ height: 48 }} />
```

### Tokens (chỉ semantic)

`--color-surface-*`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Skeleton` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Skeleton (Code Connect phase sau) |
| Import | `@giapha/ui` → `Skeleton` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
