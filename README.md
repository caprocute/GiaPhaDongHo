# GiaPhaHub

Nền tảng gia phả số dòng họ Việt Nam.

| Tài liệu | Đường dẫn |
|----------|-----------|
| Tổng quan thiết kế | [instruction/00-tong-quan.md](instruction/00-tong-quan.md) |
| Kế hoạch checklist | [instruction/13-ke-hoach-thuc-hien.md](instruction/13-ke-hoach-thuc-hien.md) |
| SRS bản cũ | [SRS/00-tong-hop.md](SRS/00-tong-hop.md) |
| Luật AI agent | [CLAUDE.md](CLAUDE.md) |

## Stack

- **Backend**: JHipster 9 → Spring Boot 4 / Java 21 (`backend/`) — core CRUD chỉ sinh bằng CLI
- **Frontend**: Next.js portal + Vite admin (`frontend/`)
- **Infra DEV**: Docker trên server remote + SSH tunnel (skill `/infra-tunnel`)

## Yêu cầu máy local

- Node **22.18+** (xem `.nvmrc`)
- Java **21** (toolchain Gradle)
- pnpm 9, Docker (chỉ khi cần), `sshpass` (tunnel bằng mật khẩu)

```bash
nvm use
```

## Hạ tầng DEV (tunnel)

```bash
cp .env.tunnel.local.example .env.tunnel.local   # điền SSH — không commit
./deploy/scripts/tunnel-infra.sh start
./deploy/scripts/tunnel-infra.sh status
cp .env.local.example .env.local                 # trỏ localhost:15432…
```

Port cố định: Postgres `15432`, Redis `16379`, MinIO `19000`, ES `19200`, Keycloak `18086`.

## Backend

```bash
cd backend
# Entity mới: sửa jdl/*.jdl rồi
# npx generator-jhipster@9.2.0 jdl jdl/<file>.jdl --no-interactive
./gradlew
```

Secret cấu hình: **Jasypt** (`ENC(...)` + `JASYPT_ENCRYPTOR_PASSWORD`).

## Frontend

```bash
cd design-tokens && npm install && npm run build && npm run lint:tokens
cd ../frontend && pnpm install
pnpm --filter @giapha/lunar test
pnpm --filter @giapha/portal dev    # :3000
pnpm --filter @giapha/admin dev     # Vite
pnpm --filter @giapha/ui storybook  # :6006
```

## CI

GitHub Actions: `.github/workflows/ci.yml` — backend compile, tokens Gate B, FE build, gitleaks.
