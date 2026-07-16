# TK-15 — File Figma DS: «Gia phả họ Hoàng»

> Mục tiêu: một file Figma làm môi trường duyệt mẫu (template CRUD + màn đại diện + signature).  
> Source of truth token vẫn là `design-tokens/` trong git (TK-04 / TK-11).

## Tên & phạm vi

| Mục | Giá trị |
|-----|---------|
| Tên file Figma | **Gia phả họ Hoàng** |
| Vai trò | Design System + mẫu màn GiaPhaHub (Portal + Admin CRM) |
| URL / file key | `https://www.figma.com/design/ETrlAF4vsj0uHiJd69jcnD/Gia-ph%E1%BA%A3-h%E1%BB%8D-Ho%C3%A0ng` |
| File key | `ETrlAF4vsj0uHiJd69jcnD` |
| Bridge setup | 2026-07-16 · 24 variables synced (Primitive / Semantic / Spacing) |

## Cấu trúc trang (sau khi Bridge nối)

1. **Cover** — tên dự án, brand «Gia phả họ Hoàng»
2. **Foundations** — Variables từ token (light; dark/tet phase sau)
3. **Components** — map `packages/ui` (sau khi có Code Connect)
4. **Templates / CRUD** — list · form · detail · empty/error · mobile
5. **Screens — Admin** — màn đại diện CRM (vd. danh sách thành viên, form hồ sơ)
6. **Screens — Portal** — hero / hồ sơ / phả đồ (signature)

## Cách tạo file (bắt buộc một lần trên máy bạn)

MCP Desktop Bridge **không tạo được file cloud mới** khi plugin chưa mở. Làm:

1. Mở **Figma Desktop** (đã thử `open -a Figma`).
2. **File → New design file**.
3. Đổi tên file thành đúng: `Gia phả họ Hoàng`.
4. **Plugins → Development → Figma Desktop Bridge → Run** (manifest: `~/.figma-console-mcp/plugin/manifest.json`).
5. Quay lại chat và báo «Bridge đã mở» (hoặc dán URL file).

Agent sẽ tiếp: đổi tên trang Cover, `figma_setup_design_tokens` từ `design-tokens/`, vẽ section template CRUD, cập nhật URL vào bảng trên + `setup bridge` trong repo.

## Token sẽ sync (semantic)

Từ `design-tokens/semantic/color.tokens.json` (resolve primitive):

- `color/action/primary-bg`, `primary-fg`
- `color/text/primary`, `muted`
- `color/surface/page`, `card`
- `color/heritage/accent`, `frame`

## Code Connect

`@figma/code-connect@1.4.9` đã cài trong `frontend/packages/ui`.

**Files mapping** (`.figma.tsx` cạnh component):

| File | Figma node | Props |
|------|-----------|-------|
| `Button/Button.figma.tsx` | `6:87`, `6:89`, `6:91` | variant=primary/secondary/ghost |
| `Badge/Badge.figma.tsx` | `6:94..102`, `6:732` | tone=default/accent/success/warning/error |
| `Alert/Alert.figma.tsx` | `6:715`, `6:718` | DiffChip → variant=success/info |
| `Input/Input.figma.tsx` | `6:815` (SearchBar), `6:727` (CommandBar) | type=search |
| `DataTable/DataTable.figma.tsx` | `6:31` (CRM Admin screen) | columns+rows |
| `StatCard/StatCard.figma.tsx` | `6:115` | value, label |
| `GioCard/GioCard.figma.tsx` | `6:119` | day, month, name, tag |
| `KPICard/KPICard.figma.tsx` | `6:124` | label, value, delta, trend |
| `SideNavItem/SideNavItem.figma.tsx` | `6:129` | icon, active, badge |
| `Panel/Panel.figma.tsx` | `6:132` | title, action, children |

**Publish** (cần Figma PAT với scope *File Content* + *Code Connect Write*):

```bash
# Lưu token (gitignored)
echo 'FIGMA_ACCESS_TOKEN=figd_...' >> frontend/packages/ui/.env.local

# Publish
cd frontend/packages/ui
FIGMA_ACCESS_TOKEN=$(grep FIGMA_ACCESS_TOKEN .env.local | cut -d= -f2) \
  npx figma connect publish
```

## Liên kết repo

- Token SoT: `design-tokens/`
- UI code: `frontend/packages/ui`
- Code Connect config: `frontend/packages/ui/figma.config.json`
- Quy trình: [11-quy-trinh-phat-trien-voi-ai.md](11-quy-trinh-phat-trien-voi-ai.md), [04-design-system-giao-dien.md](04-design-system-giao-dien.md)
