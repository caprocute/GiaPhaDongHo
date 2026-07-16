# PublicFooter — Footer Portal

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `PublicFooter.tsx` · ③ Story `PublicFooter.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Chân trang công khai (liên hệ, bản quyền). |
| **Khi không** | Không nhồi form phức tạp vào footer. |
| **Variants / API** | slots links |
| **A11y** | contentinfo landmark. |

## ④ Usage

```tsx
import { PublicFooter } from "@giapha/ui";

<PublicFooter />
```

### Tokens (chỉ semantic)

`--color-text-muted`, `--spacing-lg`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `PublicFooter` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/PublicFooter (Code Connect phase sau) |
| Import | `@giapha/ui` → `PublicFooter` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
