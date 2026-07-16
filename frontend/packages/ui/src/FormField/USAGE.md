# FormField — Khung field + label/error

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `FormField.tsx` · ③ Story `FormField.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Mọi form Portal/Admin — bọc Input/Select/DualDatePicker. |
| **Khi không** | Không bỏ label chỉ để đẹp; không hardcode màu lỗi. |
| **Variants / API** | label, error, hint, required |
| **A11y** | htmlFor/id khớp control; error gắn aria-describedby. |

## ④ Usage

```tsx
import { FormField, Input } from "@giapha/ui";

<FormField label="Mã hiệu" error={err}><Input /></FormField>
```

### Tokens (chỉ semantic)

`--color-text-*`, token lỗi semantic

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `FormField` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/FormField (Code Connect phase sau) |
| Import | `@giapha/ui` → `FormField` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
