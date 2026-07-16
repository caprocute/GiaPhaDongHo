# Switch — Công tắc

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Switch.tsx` · ③ Story `Switch.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Bật/tắt tức thì (module, thông báo). |
| **Khi không** | Không dùng cho đồng ý pháp lý dài — dùng Checkbox. |
| **Variants / API** | on/off |
| **A11y** | role=switch; aria-checked; label kề bên. |

## ④ Usage

```tsx
import { Switch } from "@giapha/ui";

<Switch label="Nhắc giỗ" checked={on} onChange={…} />
```

### Tokens (chỉ semantic)

`--color-action-primary-bg`, `--color-surface-*`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Switch` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Switch (Code Connect phase sau) |
| Import | `@giapha/ui` → `Switch` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
