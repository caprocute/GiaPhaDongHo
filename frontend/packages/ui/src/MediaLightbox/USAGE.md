# MediaLightbox — Xem ảnh phóng to

> **Done 4 mảnh (TK-04):** ① Spec (file này) · ② Code `MediaLightbox.tsx` · ③ Story `MediaLightbox.stories.tsx` · ④ Usage/mapping (file này).

## ① Spec

| | |
|--|--|
| **Khi dùng** | Album / ảnh hồ sơ (stub R0b). |
| **Khi không** | Không tải full-res không kiểm soát — dùng URL đã ký (R1.4). |
| **Variants / API** | src, alt, open |
| **A11y** | Escape đóng; focus vào dialog; alt bắt buộc. |

## ④ Usage

```tsx
import { MediaLightbox } from "@giapha/ui";

<MediaLightbox open={open} src={url} alt="Ảnh thờ" onClose={…} />
```

### Tokens (chỉ semantic)

`--color-surface-*`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `MediaLightbox` |
| Figma DS | Gia phả họ Hoàng (`ETrlAF4vsj0uHiJd69jcnD`) — Components/MediaLightbox (Code Connect phase sau) |
| Import | `@giapha/ui` → `MediaLightbox` |

### Do / Don't

- ✅ Compose trong Portal/Admin; không styled-div trùng pattern.
- ✅ Màu/spacing qua `var(--…)` từ `@giapha/tokens`.
- ❌ Hardcode hex/px/font ngoài token.
