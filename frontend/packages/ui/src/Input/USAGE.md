# Input — Ô nhập một dòng

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Input.tsx` · ③ Story `Input.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Text/email/search trong FormField. |
| **Khi không** | Không dùng cho đoạn dài — dùng Textarea. |
| **Variants / API** | kế thừa input HTML |
| **A11y** | Luôn gắn label qua FormField; placeholder không thay label. |

## ④ Usage

```tsx
import { Input, FormField } from "@giapha/ui";

<FormField label="Họ tên"><Input name="fullName" /></FormField>
```

### Tokens (chỉ semantic)

`--color-text-primary`, `--color-surface-card`, `--radius-md`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Input` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Input (Code Connect phase sau) |
| Import | `@giapha/ui` → `Input` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
