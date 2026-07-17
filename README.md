# GiaPhaHub

**Nền tảng gia phả số cho dòng họ Việt Nam**

[English](README.en.md) · [Thiết kế (TK)](instruction/00-tong-quan.md) · [SRS](SRS/00-tong-hop.md) · [Kế hoạch](instruction/13-ke-hoach-thuc-hien.md)

[![CI](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/ci.yml/badge.svg)](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/ci.yml)
[![Build & Publish](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/build-publish.yml/badge.svg)](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/build-publish.yml)
[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Node](https://img.shields.io/badge/Node-22%20LTS-green?logo=node.js)](https://nodejs.org/)

---

## Giới thiệu

GiaPhaHub số hóa **phả hệ, phả ký, ngày giỗ âm lịch, cổng thông tin và CRM quản trị** cho dòng họ Việt — không phải bản dịch của phần mềm gia phả phương Tây.

| Đối tượng | Ứng dụng |
|-----------|----------|
| Khách & thành viên | **Portal** (Next.js) — SEO, phả đồ, tin tức, công đức, tự khai |
| Tộc trưởng / ban biên tập | **Admin CRM** (Vite React) — duyệt, cấu hình, quỹ, sự kiện, tài khoản |
| Hệ thống | **API** (Spring Boot 4 + Modulith) + Keycloak, Postgres, ES, MinIO, Redis |

Một mã nguồn phục vụ nhiều gia phả (multi-tenant theo `tree_id`). Giai đoạn hiện tại: **RP — hoàn thiện production** (parity SRS/mockup, SMTP/PII thật, go-live).

---

## Tính năng chính

- **Lõi phả hệ** — người, hôn phối, đời, mã thành viên, phả đồ tương tác
- **Văn hóa Việt** — âm lịch / can chi, ngày giỗ, nhắc giỗ, công đức, khuyến học
- **Cổng thông tin** — tin tức, thông báo, thư viện media, danh nhân
- **CRM quản trị** — cấu hình hệ thống, duyệt tự khai, sự kiện & RSVP, quỹ công đức
- **Tài khoản & quyền** — đăng nhập chuẩn doanh nghiệp, 2FA, RBAC theo vai trò
- **Tìm kiếm** — Elasticsearch, hỗ trợ tiếng Việt không dấu
- **Xuất ấn phẩm** — PDF sách gia phả (pdf-render / OpenPDF)
- **Riêng tư** — người còn sống = PII (NĐ 13/2023); lọc dữ liệu theo vòng đời

Chi tiết kế thừa bản cũ: [`SRS/00-tong-hop.md`](SRS/00-tong-hop.md) · Tính năng mới: [`instruction/06-tinh-nang-moi-de-xuat.md`](instruction/06-tinh-nang-moi-de-xuat.md)

---

## Kiến trúc

```text
                    ┌─────────────┐
  Người dùng  ───►  │  Nginx/TLS  │
                    └──────┬──────┘
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         Portal       Admin CRM      imgproxy
        (Next.js)      (Vite)           │
              │            │            ▼
              └─────► API ◄─────►   MinIO
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    PostgreSQL   Elasticsearch   Redis
         │
      Keycloak (OIDC / 2FA)
```

| Quyết định | Lựa chọn |
|------------|----------|
| Backend | Modular monolith — **Spring Modulith 2** trên **Spring Boot 4** / Java 21 |
| Scaffold CRUD | **JHipster 9** (JDL, `--skip-client`) — cấm viết tay boilerplate entity |
| Frontend | Portal SSR + Admin SPA (không dùng client JHipster) |
| IAM | Keycloak 26 · JWT verify tại API |
| Secret cấu hình | **Jasypt** `ENC(...)` + `JASYPT_ENCRYPTOR_PASSWORD` |

Sơ đồ C4 đầy đủ: [`instruction/01-kien-truc-he-thong.md`](instruction/01-kien-truc-he-thong.md)

---

## Stack công nghệ

| Tầng | Công nghệ |
|------|-----------|
| API | Java 21, Spring Boot 4.x, Spring Modulith, JPA, Liquibase, springdoc OpenAPI |
| Portal | Next.js 15, React 19, TypeScript |
| Admin | Vite, React 19, TypeScript, TanStack Query |
| UI | Design tokens (DTCG) → Style Dictionary, `packages/ui`, Tailwind |
| Dữ liệu | PostgreSQL 16, Elasticsearch 8, Redis 7, MinIO |
| Media | imgproxy · pdf-render (Playwright) |
| CI/CD | GitHub Actions · GHCR · gates A/B/C/D/S |
| Quan sát | OpenTelemetry + Grafana LGTM (theo TK-09) |

Ma trận phiên bản & license: [`instruction/02-lua-chon-cong-nghe.md`](instruction/02-lua-chon-cong-nghe.md)

---

## Cấu trúc monorepo

```text
.
├── backend/                 # Spring Boot API (Gradle) + JDL
├── frontend/
│   ├── apps/portal/         # Cổng thông tin (Next.js)
│   ├── apps/admin/          # CRM quản trị (Vite)
│   ├── packages/ui|tokens|lunar|auth|tree-viz|…
│   └── visual/              # Gate C — visual regression
├── design-tokens/           # Nguồn token DTCG + Gate B
├── services/pdf-render/     # Xuất PDF headless
├── deploy/                  # Compose, remote infra, tunnel scripts
├── instruction/             # Thiết kế TK-00…TK-15
├── SRS/                     # Đặc tả chức năng (FR)
├── shared/                  # Hợp đồng dùng chung (nếu có)
├── CLAUDE.md                # Luật làm việc cho AI agent
└── README.md / README.en.md
```

---

## Yêu cầu môi trường

| Công cụ | Phiên bản |
|---------|-----------|
| Node.js | **22.18+** (xem [`.nvmrc`](.nvmrc)) |
| pnpm | 9.x |
| Java | **21** (Temurin / toolchain Gradle) |
| Docker | tùy chọn (build image) |
| `sshpass` | tunnel DEV bằng mật khẩu SSH |

```bash
nvm use
```

---

## Bắt đầu nhanh (local DEV)

### 1. Hạ tầng remote qua SSH tunnel

Postgres, Redis, MinIO, Elasticsearch, Keycloak chạy trên server DEV — máy local chỉ mở tunnel:

```bash
cp .env.tunnel.local.example .env.tunnel.local   # điền SSH — không commit
./deploy/scripts/tunnel-infra.sh start
./deploy/scripts/tunnel-infra.sh status

cp .env.local.example .env.local                 # trỏ localhost:port tunnel
```

| Dịch vụ | Port local |
|---------|------------|
| PostgreSQL | `15432` |
| Redis | `16379` |
| MinIO | `19000` |
| Elasticsearch | `19200` |
| Keycloak | `18086` |

Chi tiết: skill Cursor `/infra-tunnel` · [`deploy/remote/README.md`](deploy/remote/README.md)

### 2. Backend

```bash
cd backend
# Entity mới: sửa jdl/*.jdl rồi chạy JHipster CLI (không viết tay CRUD)
# npx generator-jhipster@9.2.0 jdl jdl/<file>.jdl --no-interactive
./gradlew
```

Bằng chứng generate: [`backend/JHIPSTER_GENERATE.md`](backend/JHIPSTER_GENERATE.md)

### 3. Frontend

```bash
cd design-tokens && npm install && npm run build && npm run lint:tokens
cd ../frontend && pnpm install

pnpm --filter @giapha/lunar test
pnpm --filter @giapha/portal dev    # http://localhost:3000
pnpm --filter @giapha/admin dev     # Vite (thường :5173)
pnpm --filter @giapha/ui storybook  # :6006
```

Cấu hình OIDC FE: copy `frontend/apps/*/ .env.example` → `.env.local` (xem chú thích trong [`.env.local.example`](.env.local.example)).

---

## Cấu hình & bí mật

| Loại | Quy ước |
|------|---------|
| Secret runtime | `.env.local`, `.env.tunnel.local` — **đã gitignore, không commit** |
| Secret trong YAML app | Jasypt `ENC(...)` · master key `JASYPT_ENCRYPTOR_PASSWORD` |
| Ví dụ | `.env.local.example`, `.env.tunnel.local.example` |

Không bao giờ đưa mật khẩu, token, hoặc khóa mã hóa vào git.

---

## Chất lượng & CI

Mọi thay đổi UI/tính năng đi qua cổng kiểm chứng (không “vibe coding”):

| Gate | Nội dung |
|------|----------|
| **A** | Build / unit / compile |
| **B** | `lint:tokens` — cấm hardcode màu hex ngoài tokens |
| **C** | Visual diff (`frontend/visual`) |
| **D** | a11y (axe) |
| **S** | Gitleaks, Semgrep, Trivy (CRITICAL fail) |

Workflows:

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — backend, frontend, security
- [`.github/workflows/build-publish.yml`](.github/workflows/build-publish.yml) — image GHCR (`api`, `portal`, `admin`)

Quy trình AI + gates: [`instruction/11-quy-trinh-phat-trien-voi-ai.md`](instruction/11-quy-trinh-phat-trien-voi-ai.md)

---

## Bảo mật & riêng tư

- Người **còn sống**: PII — serializer/export phải qua privacy filter
- Diff chạm auth / donation / privacy / upload → review bảo mật + người duyệt thứ hai
- Threat model & ASVS: [`instruction/10-an-toan-thong-tin.md`](instruction/10-an-toan-thong-tin.md)
- UI **không** lộ jargon kỹ thuật (OIDC, JWT, path API…) — xem `.cursor/rules/no-tech-jargon-on-ui.mdc`

---

## Tài liệu

| Tài liệu | Mô tả |
|----------|--------|
| [instruction/00-tong-quan.md](instruction/00-tong-quan.md) | Tổng quan thiết kế (TK-00) |
| [instruction/01-kien-truc-he-thong.md](instruction/01-kien-truc-he-thong.md) | Kiến trúc C4, monorepo |
| [instruction/02-lua-chon-cong-nghe.md](instruction/02-lua-chon-cong-nghe.md) | Stack & phương án thay thế |
| [instruction/03-thiet-ke-database.md](instruction/03-thiet-ke-database.md) | Schema, ERD |
| [instruction/07-crm-quan-tri-hien-dai.md](instruction/07-crm-quan-tri-hien-dai.md) | Thiết kế CRM |
| [instruction/09-trien-khai-va-dong-goi.md](instruction/09-trien-khai-va-dong-goi.md) | Docker, giám sát, backup |
| [instruction/12-cau-hinh-ha-tang-cicd.md](instruction/12-cau-hinh-ha-tang-cicd.md) | Infra & CI/CD |
| [instruction/13-ke-hoach-thuc-hien.md](instruction/13-ke-hoach-thuc-hien.md) | Checklist R0→R2 + **RP production** |
| [instruction/14-glossary.md](instruction/14-glossary.md) | Thuật ngữ VN ↔ code |
| [SRS/00-tong-hop.md](SRS/00-tong-hop.md) | Đặc tả FR kế thừa |
| [SRS/15-production-go-live.md](SRS/15-production-go-live.md) | SRS go-live |
| [CLAUDE.md](CLAUDE.md) | Luật AI agent / Definition of Done |

---

## Đóng góp nội bộ

1. Một PR ≈ một slice (một module hoặc một màn + test/gate liên quan)
2. Entity mới: **JDL → `jhipster jdl`** trước; chỉ bổ sung logic miền / Modulith
3. UI: dùng `packages/ui` + design tokens; form → Zod; bảng → DataTable; ngày → DualDatePicker
4. Commit tiếng Việt: `[module] hành động — tham chiếu TK/FR`
5. Sau đơn vị việc ổn định: commit + push (xem `.cursor/rules/commit-push-when-done.mdc`)

---

## Trạng thái phát hành

| Giai đoạn | Nội dung |
|-----------|----------|
| R0–R2 | Nền tảng, lõi phả hệ, CMS, công đức/sự kiện/thông báo — khung đã hoàn thành |
| **RP** | Parity mockup/SRS, SMTP/PII thật, E2E, backup/restore, go-live |
| Sau go-live | Bản đồ mộ, di sản Hán-Nôm, trợ lý AI, multi-tenant SaaS (không chặn phát hành) |

Theo dõi checklist: [`instruction/13-ke-hoach-thuc-hien.md`](instruction/13-ke-hoach-thuc-hien.md)

---

## Giấy phép

Mã nguồn và tài liệu thuộc quyền sở hữu của chủ dự án. Không phân phối lại khi chưa có thỏa thuận bằng văn bản.

---

## Liên hệ

Vấn đề kỹ thuật / vận hành: mở issue trên repository hoặc liên hệ chủ sở hữu GitHub của tổ chức dự án.
