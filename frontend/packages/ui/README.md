# `@giapha/ui` — Design system code (TK-04 / R0b)

Compose Portal/Admin từ đây. Token chỉ từ `@giapha/tokens`.

## Done = 4 mảnh

| # | Mảnh | Artifact |
|---|------|----------|
| ① | Spec | `src/<Name>/USAGE.md` § Spec |
| ② | Code | `src/<Name>/<Name>.tsx` (states / token / a11y tối thiểu) |
| ③ | Story | `src/<Name>/<Name>.stories.tsx` (+ Storybook autodocs) |
| ④ | Usage / mapping | cùng `USAGE.md` § Usage + bảng Figma/Storybook |

Figma DS: **Gia phả họ Hoàng** — [`ETrlAF4vsj0uHiJd69jcnD`](https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-phả-họ-Hoàng). Code Connect gắn sau khi có component Figma chuẩn.

## Catalog (R0b)

| Component | Story | USAGE.md |
|-----------|:-----:|:--------:|
| Button | ✅ | ✅ |
| Input | ✅ | ✅ |
| Textarea | ✅ | ✅ |
| Select | ✅ | ✅ |
| Checkbox | ✅ | ✅ |
| Switch | ✅ | ✅ |
| FormField | ✅ | ✅ |
| DualDatePicker | ✅ | ✅ |
| DataTable | ✅ | ✅ |
| Pagination | ✅ | ✅ |
| Badge | ✅ | ✅ |
| Alert | ✅ | ✅ |
| Toast | ✅ | ✅ |
| Skeleton | ✅ | ✅ |
| EmptyState | ✅ | ✅ |
| Dialog | ✅ | ✅ |
| AppShell | ✅ | ✅ |
| PublicHeader | ✅ | ✅ |
| PublicFooter | ✅ | ✅ |
| Breadcrumb | ✅ | ✅ |
| Tabs | ✅ | ✅ |
| LunarDateBadge | ✅ | ✅ |
| PersonNameDisplay | ✅ | ✅ |
| MediaLightbox | ✅ | ✅ |
| HonorBoardCard | ✅ | ✅ |
| ClanSeal | ✅ | ✅ |

## Scripts

```bash
pnpm --filter @giapha/ui storybook
pnpm --filter @giapha/ui build
```
