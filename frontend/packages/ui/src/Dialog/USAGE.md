# Dialog — Hộp thoại modal

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Dialog.tsx` · ③ Story `Dialog.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Xác nhận xóa, form ngắn overlay. |
| **Khi không** | Không nhồi cả trang settings vào Dialog. |
| **Variants / API** | open, title, onClose |
| **A11y** | Focus trap; Escape đóng; aria-modal. |

## ④ Usage

```tsx
import { Dialog } from "@giapha/ui";

<Dialog open={open} title="Xác nhận" onClose={…}>…</Dialog>
```

### Tokens (chỉ semantic)

`--color-surface-card`, `--radius-lg`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Dialog` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Dialog (Code Connect phase sau) |
| Import | `@giapha/ui` → `Dialog` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
