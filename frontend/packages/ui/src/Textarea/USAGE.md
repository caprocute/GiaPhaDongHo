# Textarea — Ô nhập nhiều dòng

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Textarea.tsx` · ③ Story `Textarea.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Tiểu sử, ghi chú, nội dung dài. |
| **Khi không** | Không dùng cho một dòng ngắn — dùng Input. |
| **Variants / API** | kế thừa textarea HTML |
| **A11y** | Label qua FormField; có thể rows + resize theo token spacing. |

## ④ Usage

```tsx
import { Textarea, FormField } from "@giapha/ui";

<FormField label="Ghi chú"><Textarea name="notes" rows={4} /></FormField>
```

### Tokens (chỉ semantic)

`--color-text-primary`, `--spacing-md`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Textarea` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Textarea (Code Connect phase sau) |
| Import | `@giapha/ui` → `Textarea` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
