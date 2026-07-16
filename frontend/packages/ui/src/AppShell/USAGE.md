# AppShell — Khung Admin CRM

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `AppShell.tsx` · ③ Story `AppShell.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Layout sidebar + main cho Vite admin. |
| **Khi không** | Không dùng trên Portal công khai — dùng PublicHeader/Footer. |
| **Variants / API** | sidebar, children |
| **A11y** | Landmark nav/main; skip link khuyến nghị. |

## ④ Usage

```tsx
import { AppShell } from "@giapha/ui";

<AppShell sidebar={menu}>{page}</AppShell>
```

### Tokens (chỉ semantic)

`--color-surface-page`, `--spacing-*`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `AppShell` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/AppShell (Code Connect phase sau) |
| Import | `@giapha/ui` → `AppShell` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
