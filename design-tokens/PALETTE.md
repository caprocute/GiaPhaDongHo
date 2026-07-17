# Palette & chế độ giao diện (TK-04)

Hai trục độc lập — đổi qua attribute trên `<html>`:

| Attribute | Giá trị | Mặc định |
|-----------|---------|----------|
| `data-palette` | `bang-vang` · `co` | `bang-vang` |
| `data-mode` | `light` · `dark` (đã resolve) | theo hệ thống |

UI chọn mode `system` → resolve `prefers-color-scheme` rồi ghi `data-mode` light/dark.

## Palette `bang-vang` (v3 — Bảng vàng)

| Tên | HEX | Vai trò |
|-----|-----|---------|
| Alabaster | `#EBEBE6` | Nền trang |
| Urobilin | `#E2AF1D` | Accent |
| Philippine Gold | `#AE720C` | CTA |
| Dark Bronze | `#824807` | Hover CTA |
| Raisin Black | `#29241D` | Chữ + frame |

Nguồn: `primitive/color.bang-vang.tokens.json`.

## Palette `co` (cổ — son đỏ / kem)

| Tên | HEX | Vai trò |
|-----|-----|---------|
| Paper | `#FAF5E9` | Nền kem |
| Son | `#8E2A1A` | Brand / CTA |
| Nghệ | `#C9A227` | Accent vàng |
| Ink | `#26190F` | Chữ |

Nguồn: `primitive/color.co.tokens.json` (palette trước đổi Bảng vàng).

## Semantic

Component **chỉ** dùng `--color-surface-*`, `--color-text-*`, `--color-action-*`, `--color-heritage-*`, `--color-status-*`, `--color-border-*`.

- Light: map primitive `L*` / `ink.900` / `gold.400`…
- Dark: map `D*` / `ink.d*` / `gold.d*`… (cùng tên semantic)

Build: `pnpm --dir design-tokens run build` → `frontend/packages/tokens/src/tokens.css`.
