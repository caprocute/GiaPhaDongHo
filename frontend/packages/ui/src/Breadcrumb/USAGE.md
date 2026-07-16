# Breadcrumb — Đường dẫn phân cấp

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Breadcrumb.tsx` · ③ Story `Breadcrumb.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Vị trí trang trong Admin/Portal sâu. |
| **Khi không** | Không thay primary nav. |
| **Variants / API** | items[] |
| **A11y** | nav + aria-label; trang hiện tại aria-current. |

## ④ Usage

```tsx
import { Breadcrumb } from "@giapha/ui";

<Breadcrumb items={[{label:"CRM",href:"/"},{label:"Người"}]} />
```

### Tokens (chỉ semantic)

`--color-text-muted`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Breadcrumb` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Breadcrumb (Code Connect phase sau) |
| Import | `@giapha/ui` → `Breadcrumb` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
