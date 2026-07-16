# PublicHeader — Header Portal

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `PublicHeader.tsx` · ③ Story `PublicHeader.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Điều hướng công khai trang họ. |
| **Khi không** | Không dùng trong Admin AppShell. |
| **Variants / API** | nav items / brand |
| **A11y** | nav landmark; mobile menu focusable. |

## ④ Usage

```tsx
import { PublicHeader } from "@giapha/ui";

<PublicHeader />
```

### Tokens (chỉ semantic)

`--color-heritage-frame`, `--font-display`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `PublicHeader` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/PublicHeader (Code Connect phase sau) |
| Import | `@giapha/ui` → `PublicHeader` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
