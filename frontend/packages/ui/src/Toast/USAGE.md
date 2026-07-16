# Toast — Thông báo tạm

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Toast.tsx` · ③ Story `Toast.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Feedback sau lưu/xóa (ephemeral). |
| **Khi không** | Không thay Alert cố định trong form. |
| **Variants / API** | message, tone |
| **A11y** | aria-live=polite; không chặn keyboard. |

## ④ Usage

```tsx
import { Toast } from "@giapha/ui";

<Toast message="Đã lưu" />
```

### Tokens (chỉ semantic)

`--color-surface-card`, motion token

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Toast` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Toast (Code Connect phase sau) |
| Import | `@giapha/ui` → `Toast` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
