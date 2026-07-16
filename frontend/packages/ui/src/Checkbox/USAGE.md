# Checkbox — Hộp kiểm

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Checkbox.tsx` · ③ Story `Checkbox.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Bật/tắt độc lập hoặc chọn nhiều. |
| **Khi không** | Không dùng cho on/off tức thì một cờ — cân nhắc Switch. |
| **Variants / API** | checked / indeterminate (HTML) |
| **A11y** | Label clickable; nhóm checkbox cần fieldset/legend. |

## ④ Usage

```tsx
import { Checkbox } from "@giapha/ui";

<Checkbox label="Đồng ý điều khoản" />
```

### Tokens (chỉ semantic)

`--color-action-primary-bg`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Checkbox` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Checkbox (Code Connect phase sau) |
| Import | `@giapha/ui` → `Checkbox` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
