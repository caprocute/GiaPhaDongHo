# EmptyState — Trạng thái trống

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `EmptyState.tsx` · ③ Story `EmptyState.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Không có dòng nào / chưa có cây mẫu. |
| **Khi không** | Không dùng khi đang loading — Skeleton. |
| **Variants / API** | title, description, action |
| **A11y** | Heading rõ; CTA keyboard-focusable. |

## ④ Usage

```tsx
import { EmptyState, Button } from "@giapha/ui";

<EmptyState title="Chưa có thành viên" action={<Button>Thêm</Button>} />
```

### Tokens (chỉ semantic)

`--color-text-muted`, `--spacing-lg`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `EmptyState` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/EmptyState (Code Connect phase sau) |
| Import | `@giapha/ui` → `EmptyState` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
