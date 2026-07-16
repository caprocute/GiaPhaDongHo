# Tabs — Tab nội dung

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `Tabs.tsx` · ③ Story `Tabs.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Chia panel (Phả ký / Tộc ước / Hồ sơ). |
| **Khi không** | Không dùng thay route chính khi cần URL riêng — cân nhắc routing. |
| **Variants / API** | items[], value |
| **A11y** | tablist/tab/tabpanel; mũi tên điều hướng. |

## ④ Usage

```tsx
import { Tabs } from "@giapha/ui";

<Tabs items={[{id:"a",label:"Phả ký",content:…}]} />
```

### Tokens (chỉ semantic)

`--color-action-primary-bg`, `--spacing-md`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `Tabs` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/Tabs (Code Connect phase sau) |
| Import | `@giapha/ui` → `Tabs` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
