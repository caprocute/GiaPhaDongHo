# Pagination — Phân trang

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Pagination.tsx` · ③ Story `Pagination.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Đi kèm DataTable / list API page. |
| **Khi không** | Không tự chế nút prev/next rời token. |
| **Variants / API** | page, pageCount, onChange |
| **A11y** | Nút disabled ở biên; aria-label Trang trước/sau. |

## ④ Usage

```tsx
import { Pagination } from "@giapha/ui";

<Pagination page={1} pageCount={10} onChange={setPage} />
```

### Tokens (chỉ semantic)

`--spacing-sm`, `--color-action-*`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Pagination` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Pagination (Code Connect phase sau) |
| Import | `@giapha/ui` → `Pagination` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
