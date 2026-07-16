# Button — Nút hành động

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Button.tsx` · ③ Story `Button.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | CTA chính/phụ trong form, toolbar, dialog. |
| **Khi không** | Không dùng cho liên kết điều hướng dài — dùng Link/Breadcrumb. |
| **Variants / API** | primary | secondary | ghost |
| **A11y** | Native `<button>`; minHeight 44px; giữ disabled/aria-label khi icon-only. |

## ④ Usage

```tsx
import { Button } from "@giapha/ui";

<Button variant="primary">Lưu</Button>
```

### Tokens (chỉ semantic)

`--color-action-primary-bg/fg`, `--spacing-*`, `--radius-md`, `--font-body`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Button` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Button (Code Connect phase sau) |
| Import | `@giapha/ui` → `Button` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
