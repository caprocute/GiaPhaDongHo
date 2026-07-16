# TK-15 — File Figma DS: «Gia phả họ Hoàng»

> Mục tiêu: một file Figma làm môi trường duyệt mẫu (template CRUD + màn đại diện + signature).  
> Source of truth token vẫn là `design-tokens/` trong git (TK-04 / TK-11).

## Tên & phạm vi

| Mục | Giá trị |
|-----|---------|
| Tên file Figma | **Gia phả họ Hoàng** |
| Vai trò | Design System + mẫu màn GiaPhaHub (Portal + Admin CRM) |
| URL / file key | *(điền sau khi tạo — dạng `https://www.figma.com/design/<KEY>/…`)* |

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

## Liên kết repo

- Token SoT: `design-tokens/`
- UI code: `frontend/packages/ui`
- Quy trình: [11-quy-trinh-phat-trien-voi-ai.md](11-quy-trinh-phat-trien-voi-ai.md), [04-design-system-giao-dien.md](04-design-system-giao-dien.md)
