# Dialog — Hộp thoại modal

> **Done 4 mảnh (TK-04):** ① Spec · ② Code · ③ Story · ④ Usage.

## ① Spec

| | |
|--|--|
| **Khi dùng** | Xác nhận ngắn; form đề cử / nghi thức (overlay). |
| **Khi không** | Không nhồi cả trang settings vào Dialog. |
| **Variants** | `default` · `ceremonial` (khung đôi, nền kem, eyebrow) |
| **API** | `open`, `title`, `description?`, `eyebrow?`, `footer?`, `variant?`, `size?`, `onClose` |
| **A11y** | `aria-modal`; Escape đóng; bấm nền đóng; focus phần tử tương tác đầu tiên. |

## ④ Usage

```tsx
import { Dialog, Button } from "@giapha/ui";

<Dialog
  open={open}
  variant="ceremonial"
  eyebrow="Nghi thức dòng họ"
  title="Đề cử thành tích"
  description="…"
  onClose={() => setOpen(false)}
  footer={
    <>
      <Button variant="secondary" onClick={() => setOpen(false)}>Để sau</Button>
      <Button type="submit" form="nominate-form">Gửi đề cử</Button>
    </>
  }
>
  <form id="nominate-form">…</form>
</Dialog>
```

### Tokens

`--color-surface-*`, `--color-heritage-*`, `--radius-lg`, `--shadow-md`, `--font-display`

### Mapping

| Nguồn | Liên kết |
|-------|----------|
| Storybook | `GiaPha/Dialog` |
| F8 Khuyến học | Form đề cử chỉ trong popup ceremonial |
| Import | `@giapha/ui` → `Dialog` |
