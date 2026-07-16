# Alert — Cảnh báo nội tuyến

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Alert.tsx` · ③ Story `Alert.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Thông báo cố định trong trang (lỗi form, nhắc privacy). |
| **Khi không** | Không dùng cho toast tạm — dùng Toast. |
| **Variants / API** | info | success | warning | error |
| **A11y** | role=alert khi error; có thể dismiss. |

## ④ Usage

```tsx
import { Alert } from "@giapha/ui";

<Alert variant="warning">Người còn sống — ẩn PII</Alert>
```

### Tokens (chỉ semantic)

`--color-*` semantic alert

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Alert` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Alert (Code Connect phase sau) |
| Import | `@giapha/ui` → `Alert` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
