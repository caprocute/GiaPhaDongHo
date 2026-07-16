# Keycloak realm — R1.5 IAM (GiaPhaHub)

File import: `jhipster-realm.json` (realm `jhipster`).

## Realm roles

| Role | Ý nghĩa |
|------|---------|
| `ROLE_ADMIN` | Toàn quyền platform |
| `ROLE_GENEALOGY_ADMIN` | Quản trị phả hệ (bắt buộc cấu hình TOTP lần đầu) |
| `ROLE_EDITOR` | Biên tập CMS / media |
| `ROLE_MEMBER` | Thành viên dòng họ |
| `ROLE_USER` | Role JHipster mặc định (tương đương quyền đọc cơ bản) |

## Clients (PKCE public)

| clientId | App | Redirect |
|----------|-----|----------|
| `giapha_admin` | Vite Admin `:5173` | `http://localhost:5173/*` |
| `giapha_portal` | Next Portal `:3000` | `http://localhost:3000/*` |
| `web_app` | JHipster / dụng chung | localhost wildcard |

## Users mẫu (password giống user JHipster mặc định: `user` / admin: `admin`)

| User | Groups | 2FA |
|------|--------|-----|
| `admin` | Admins… | `CONFIGURE_TOTP` bắt buộc lần đầu |
| `genealogy` | GenealogyAdmins | `CONFIGURE_TOTP` bắt buộc lần đầu |
| `editor` | Editors | tùy chọn |
| `member` / `user` | Members | tùy chọn |

**Backup / recovery codes (SRS-10):** dùng Account Console Keycloak → Signing in → Recovery codes (sau khi bật TOTP). Không tự implement OTP trong app.

## Re-import DEV

Local compose (`backend` docker / `deploy/compose`): mount `realm-config` + `--import-realm`.

Remote `gph-keycloak` (đã chạy, không auto-import):

```bash
# Cần .env.tunnel.local + tunnel (hoặc SSH trực tiếp)
./deploy/scripts/sync-keycloak-realm.sh
```

Script upload `jhipster-realm.json` → `~/giapha-infra/realm-config/`, chạy `kc.sh import --override=true`, restart container.

Sau đó local:

```bash
./deploy/scripts/tunnel-infra.sh start
# Admin:  cp frontend/apps/admin/.env.example  frontend/apps/admin/.env.local
# Portal: cp frontend/apps/portal/.env.example frontend/apps/portal/.env.local
```
