# Select — Danh sách chọn

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Select.tsx` · ③ Story `Select.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Chọn 1 giá trị từ tập hữu hạn (giới tính, chuyên mục…). |
| **Khi không** | Không dùng khi cần gõ tự do — dùng Input + suggest (R1.2). |
| **Variants / API** | options[] |
| **A11y** | Label FormField; option rỗng cho placeholder. |

## ④ Usage

```tsx
import { Select, FormField } from "@giapha/ui";

<FormField label="Giới tính"><Select options={[{value:"M",label:"Nam"}]} /></FormField>
```

### Tokens (chỉ semantic)

`--color-surface-card`, `--color-text-primary`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Select` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Select (Code Connect phase sau) |
| Import | `@giapha/ui` → `Select` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
