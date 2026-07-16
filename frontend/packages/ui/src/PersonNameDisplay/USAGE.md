# PersonNameDisplay — Hiển thị tên người

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `PersonNameDisplay.tsx` · ③ Story `PersonNameDisplay.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Tên + đời/xưng hô trên list/hồ sơ (privacy UI). |
| **Khi không** | Không tự lộ ngày sinh đầy đủ cho khách — BE privacy filter. |
| **Variants / API** | fullName, generation, honorific |
| **A11y** | Không dùng màu làm tín hiệu sống/mất duy nhất. |

## ④ Usage

```tsx
import { PersonNameDisplay } from "@giapha/ui";

<PersonNameDisplay fullName="Nguyễn Văn A" generation={7} />
```

### Tokens (chỉ semantic)

`--font-display`, `--color-text-primary`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `PersonNameDisplay` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/PersonNameDisplay (Code Connect phase sau) |
| Import | `@giapha/ui` → `PersonNameDisplay` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
