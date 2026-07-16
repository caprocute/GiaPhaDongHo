# DataTable — Bảng dữ liệu

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `DataTable.tsx` · ③ Story `DataTable.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Danh sách CRM (người, bài, album). |
| **Khi không** | Không dùng div-grid giả bảng khi cần sort/a11y bảng. |
| **Variants / API** | columns[], data[], empty |
| **A11y** | table/th/td semantic; caption hoặc aria-label. |

## ④ Usage

```tsx
import { DataTable } from "@giapha/ui";

<DataTable columns={cols} data={rows} />
```

### Tokens (chỉ semantic)

`--color-surface-card`, `--color-text-muted`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `DataTable` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/DataTable (Code Connect phase sau) |
| Import | `@giapha/ui` → `DataTable` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
