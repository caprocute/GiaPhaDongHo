# Theme — Palette × light/dark

> **Done 4 mảnh (TK-04):** ① Spec · ② Code · ③ Story · ④ Usage.

## ① Spec

| | |
|--|--|
| **Khi dùng** | Bọc app (portal/admin); đặt `AppearanceControl` trên header; `ThemeScript` chống FOUC. |
| **API HTML** | `data-palette="bang-vang\|co"` · `data-mode="light\|dark"` (đã resolve) |
| **Mode** | `light` · `dark` · `system` (mặc định system) |
| **Lưu** | `localStorage` key `giapha.appearance` |

Component UI **không** nhận prop màu — chỉ `var(--color-*)` semantic; đổi theme = đổi token.

## ④ Usage

```tsx
import { ThemeProvider, ThemeScript, AppearanceControl } from "@giapha/ui";

// layout.tsx <head>
<html lang="vi">
  <head><ThemeScript /></head>
  <body>
    <ThemeProvider>
      <PublicHeader utilityRight={<AppearanceControl />} … />
      {children}
    </ThemeProvider>
  </body>
</html>
```

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Tokens | `design-tokens/PALETTE.md` |
| Storybook | `GiaPha/Theme` |
| Figma | Variables sync phase sau |
