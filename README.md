# GiaPhaHub

**Nền tảng gia phả số cho dòng họ Việt Nam**

[English](README.en.md) · [Thiết kế TK](instruction/00-tong-quan.md) · [SRS](SRS/00-tong-hop.md) · [Kế hoạch RP](instruction/13-ke-hoach-thuc-hien.md) · [Luật AI](CLAUDE.md)

[![CI](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/ci.yml/badge.svg)](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/ci.yml)
[![Build & Publish](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/build-publish.yml/badge.svg)](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/build-publish.yml)
[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Node](https://img.shields.io/badge/Node-22%20LTS-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey)](#giấy-phép)

---

## Mục lục

1. [Giới thiệu & bối cảnh](#1-giới-thiệu--bối-cảnh)
2. [Đối tượng sử dụng](#2-đối-tượng-sử-dụng)
3. [Khả năng sản phẩm](#3-khả-năng-sản-phẩm)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Module backend](#5-module-backend)
6. [Ứng dụng frontend](#6-ứng-dụng-frontend)
7. [Chuẩn API](#7-chuẩn-api)
8. [Stack & phiên bản](#8-stack--phiên-bản)
9. [Cấu trúc monorepo](#9-cấu-trúc-monorepo)
10. [Yêu cầu môi trường](#10-yêu-cầu-môi-trường)
11. [Bắt đầu nhanh (local DEV)](#11-bắt-đầu-nhanh-local-dev)
12. [Quy trình phát triển](#12-quy-trình-phát-triển)
13. [Cấu hình & bí mật](#13-cấu-hình--bí-mật)
14. [Chất lượng, gates & CI/CD](#14-chất-lượng-gates--cicd)
15. [Bảo mật & riêng tư](#15-bảo-mật--riêng-tư)
16. [Triển khai & vận hành](#16-triển-khai--vận-hành)
17. [Tài liệu](#17-tài-liệu)
18. [Trạng thái phát hành](#18-trạng-thái-phát-hành)
19. [Đóng góp nội bộ](#19-đóng-góp-nội-bộ)
20. [Giấy phép & liên hệ](#20-giấy-phép--liên-hệ)

---

## 1. Giới thiệu & bối cảnh

**GiaPhaHub** là nền tảng số hóa toàn diện cho **dòng họ Việt Nam**: phả hệ nhiều đời, phả ký / tộc ước / hương hỏa, ngày giỗ âm lịch, cổng thông tin dòng họ, và CRM quản trị hiện đại cho tộc trưởng / ban biên tập.

### Vì sao không dùng phần mềm gia phả quốc tế?

Phần mềm phương Tây (GEDCOM, webtrees…) thiếu các nhu cầu **hạng nhất** của họ tộc Việt:

| Nhu cầu văn hóa Việt | Cách GiaPhaHub xử lý |
|----------------------|----------------------|
| Ngày giỗ theo **âm lịch** (tháng nhuận, can chi) | `core.lunar` (Java) + `packages/lunar` (TS), chung golden test |
| Thờ phụng người đã khuất vs **PII người còn sống** | Privacy tier theo vòng đời (NĐ 13/2023) |
| Công đức, bảng vàng, khuyến học, họp họ | Module donation / scholarship / event |
| Cổng tin tức + SEO mạnh như site họ tộc cũ | Portal Next.js SSR + CMS |
| Tộc trưởng lớn tuổi dùng được | Admin CRM tiếng Việt, chữ to, ≤ 3 click, DualDatePicker |

### Nguồn đặc tả

- **SRS** trong `SRS/` — reverse-engineer từ trang họ tộc thực tế (NukeViet + module gia-pha + theme hotoc), gồm ~1.500+ thành viên / 13 đời ở bản mẫu quan sát.
- **Thiết kế hệ thống** `instruction/` (TK-00…TK-15) — kiến trúc, DB, design system, ATTT, CI/CD, kế hoạch R0→R2 + **RP production**.
- Mục tiêu sản phẩm: **một bộ mã** phục vụ nhiều dòng họ (multi-tenant theo `tree_id`), đóng gói được trên một VPS vừa đủ.

Giai đoạn hiện tại: sau khung R0–R2, trọng tâm là **RP — hoàn thiện production** (parity mockup/SRS, SMTP/PII thật, E2E, backup/restore, go-live). Chi tiết: [`instruction/13-ke-hoach-thuc-hien.md`](instruction/13-ke-hoach-thuc-hien.md).

---

## 2. Đối tượng sử dụng

| Actor | Mục tiêu chính | Kênh |
|-------|----------------|------|
| **Khách vãng lai** | Xem phả đồ, tìm người đã khuất, đọc tin, xem công đức | Portal công khai |
| **Thành viên dòng họ** | Đăng nhập, bình luận, tự khai hồ sơ nhánh mình, nhận nhắc giỗ | Portal + thông báo |
| **Ban biên tập** | Soạn / duyệt bài, album, bình luận | Admin CRM |
| **Tộc trưởng / thư ký gia phả** | CRUD thành viên, soạn phả đồ, ngày giỗ, duyệt tự khai, quỹ | Admin CRM |
| **Quản trị hệ thống** | Cấu hình site (13 mục SRS-12b), SMTP/Zalo, PII, tài khoản, backup | Admin → Hệ thống |

Triết lý CRM: *«tộc trưởng 70 tuổi dùng được, thư ký 20 tuổi dùng sướng»* — xem [`instruction/07-crm-quan-tri-hien-dai.md`](instruction/07-crm-quan-tri-hien-dai.md).

---

## 3. Khả năng sản phẩm

### 3.1 Lõi phả hệ (genealogy)

- Hồ sơ thành viên: họ tên, giới tính, đời, mã hiệu, quan hệ cha/mẹ/vợ chồng, tình trạng sống/mất
- Hôn phối (union), cây nhiều đời, lọc theo nhánh / đời / trạng thái
- **Phả đồ** tương tác: pan/zoom, minimap, xuất PNG/SVG — render React Flow + layout engine riêng (`packages/tree-viz`) tôn trọng luật gia phả Việt (cặp vợ chồng, thứ tự con)
- **Soạn phả đồ (Admin Tree Editor)**: sửa trên canvas, +Con / +Vợ chồng, kéo đổi quan hệ có xác nhận (SRS-12a)
- Chương sách: phả ký, tộc ước, hương hỏa
- Xuất ấn phẩm: PDF sách gia phả (dịch vụ pdf-render / fallback OpenPDF), Excel danh sách

### 3.2 Âm lịch & ngày giỗ

- Đổi dương ↔ âm, can chi, tháng nhuận (thuật toán amlich Hồ Ngọc Đức, UTC+7)
- Lịch giỗ theo tháng âm; ghi đè; cấu hình nhắc trước N ngày
- Dashboard admin: KPI giỗ trong tháng âm hiện tại
- Kênh nhắc: email (SMTP từ TreeSettings), Zalo OA (theo mode cấu hình), web push

### 3.3 Cổng thông tin (CMS + media)

- Tin tức / chuyên mục / trang tĩnh, lịch đăng, bình luận
- Trang chủ dạng widget (parity block NukeViet) — cấu hình qua API
- Thư viện media, album ảnh (MinIO), resize on-the-fly (imgproxy)
- Danh nhân, liên hệ, tìm kiếm toàn site + trong gia phả (Elasticsearch, folding tiếng Việt)

### 3.4 Cộng đồng & quỹ

- **Công đức**: chiến dịch, ghi nhận đóng góp, bảng vàng, sao kê / biên nhận
- **Sự kiện**: lịch họp họ, checklist, RSVP, điểm danh
- **Khuyến học**: đề cử → duyệt → công bố
- **Tự khai (moderation)**: con cháu gửi diff hồ sơ → hàng đợi duyệt → áp vào genealogy có version

### 3.5 Tài khoản, quyền, cấu hình

- Đăng nhập OIDC qua Keycloak (2FA TOTP cho role quản trị)
- RBAC dạng `module:entity:action` + `@RequiresPermission` trên API
- Màn **Tài khoản** admin: list / duyệt / khóa / gán role / reset mật khẩu / lịch sử đăng nhập
- **Cấu hình hệ thống** (SRS-12b): ~13 nhóm settings (site, SMTP, Zalo, PII, feature flag…) — secret không trả về GET

### 3.6 Ánh xạ SRS (nhóm tài liệu)

| Nhóm | File SRS |
|------|----------|
| Hồ sơ & phả hệ | [03](SRS/03-gia-pha-ho-so-thanh-vien.md), [04](SRS/04-pha-do-truc-quan.md), [05](SRS/05-ngay-gio-am-lich.md) |
| CMS & media | [06](SRS/06-tin-tuc-noi-dung.md), [08](SRS/08-thu-vien-album-anh.md) |
| Công đức / tìm kiếm / tài khoản | [07](SRS/07-cong-duc.md), [09](SRS/09-tim-kiem.md), [10](SRS/10-thanh-vien-tai-khoan.md) |
| CRM & cấu hình | [12](SRS/12-quan-tri-crm-an.md), [12a](SRS/12a-admin-soan-pha-do.md), [12b](SRS/12b-admin-cau-hinh.md) |
| Production | [15](SRS/15-production-go-live.md) |

Tính năng mới thuần Việt (đề xuất): [`instruction/06-tinh-nang-moi-de-xuat.md`](instruction/06-tinh-nang-moi-de-xuat.md).

---

## 4. Kiến trúc hệ thống

### 4.1 Sơ đồ container (rút gọn)

```text
                         Người dùng
                              │
                              ▼
                     ┌────────────────┐
                     │  Nginx / Caddy │  TLS, HTTP/3, cache tĩnh
                     └────────┬───────┘
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
     Portal (Next.js)   Admin CRM (Vite)    imgproxy
      SSR / SEO           SPA mật độ cao         │
           │                  │                  ▼
           └────────►  giapha-api  ◄────────── MinIO
                    Spring Boot 4
                    Modulith modules
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   PostgreSQL 16     Elasticsearch 8      Redis 7
         │
         └── Keycloak 26 (OIDC, 2FA)
                    │
              pdf-render (Playwright) ← job xuất sách
```

Sơ đồ C4 đầy đủ + sequence nghiệp vụ: [`instruction/01-kien-truc-he-thong.md`](instruction/01-kien-truc-he-thong.md).

### 4.2 Quyết định then chốt

| Quyết định | Lựa chọn | Lý do ngắn |
|------------|----------|------------|
| Kiểu BE | **Modular monolith** (Spring Modulith 2) | Một artifact dễ triển khai; ranh giới module cưỡng chế bằng test; tách microservice sau nếu cần |
| Framework | **Spring Boot 4.x** / Java 21 | Dòng OSS hiện hành; không bootstrap Boot 3 / JHipster 8 |
| Sinh CRUD | **JHipster 9** JDL (`--skip-client`) | Entity/Repo/Resource/DTO/MapStruct/Liquibase do CLI; AI chỉ viết JDL + nghiệp vụ |
| FE tách 2 app | Portal Next.js + Admin Vite | Portal cần SEO; Admin cần tương tác dày; **không** dùng client JHipster |
| Giao tiếp module | Event Modulith + outbox | Không query chéo bảng module khác |
| Multi-tenant | Cột `tree_id` (+ RLS giai đoạn SaaS) | Một mã nguồn nhiều dòng họ |
| Secret YAML | **Jasypt** `ENC(...)` | Master key chỉ qua env |

### 4.3 Luồng nghiệp vụ tiêu biểu

**Ghi nhận người mất → giỗ + nhắc**

1. Admin cập nhật hồ sơ (trạng thái đã khuất + ngày mất âm).
2. `genealogy` validate âm lịch (`core.lunar`), ghi audit.
3. Event → `search` reindex; event → `notification` lập lịch nhắc (email/Zalo).

**Tự khai → duyệt**

1. Thành viên gửi change-request (diff nhánh mình).
2. `moderation` hàng đợi + phân công thư ký.
3. Duyệt → áp diff vào `genealogy` (versioned) → thông báo kết quả.

---

## 5. Module backend

Package gốc: `vn.giapha.*`. Mỗi module Modulith chỉ public `api/` + `events/`; phần còn lại `internal/`.

| Module | Trách nhiệm |
|--------|-------------|
| **core** | Shared kernel: tenant, lunar, security helpers, audit |
| **genealogy** | Person, union, chapter, anniversary, export cây / sách |
| **cms** | Post, category, comment, page, honor board |
| **media** | Album, asset, adapter MinIO |
| **donation** | Campaign, contribution, sao kê |
| **event** | Sự kiện dòng họ, RSVP, checklist, phân công |
| **notification** | SMTP thật từ TreeSettings, Zalo OA, web push, outbox |
| **search** | Indexer + query Elasticsearch |
| **moderation** | Change-request / tự khai |
| **iam** | Bridge Keycloak, RBAC catalog, quản trị tài khoản |
| **scholarship** | Khuyến học |
| **system** | Module registry, settings cây, health nghiệp vụ |

**Quy tắc bắt buộc khi thêm entity**

1. Viết/sửa `backend/**/*.jdl`
2. Chạy `npx generator-jhipster@9 jdl … --no-interactive` trong `backend/`
3. Commit artifact do CLI tạo (Liquibase, MapStruct…)
4. Chỉ sau đó mới viết privacy / permission / event / adapter

Cấm viết tay CRUD “kiểu JHipster” hoặc copy sample từ repo khác. Bằng chứng: [`backend/JHIPSTER_GENERATE.md`](backend/JHIPSTER_GENERATE.md).

---

## 6. Ứng dụng frontend

### 6.1 Portal — `@giapha/portal`

- Next.js 15 App Router, React 19, SSR/SSG cho SEO & Open Graph
- Trang: chủ, phả đồ, hồ sơ, giỗ, tin tức, công đức, tự khai, thư viện…
- Theme / site title lấy từ TreeSettings công khai
- OIDC qua `packages/auth` (PKCE)

### 6.2 Admin CRM — `@giapha/admin`

Cây thông tin (IA) mục tiêu:

```text
Bảng điều khiển
Gia phả ………… Tree Editor, danh sách người, chương sách, ngày giỗ, xuất ấn phẩm
Duyệt …………… Tự khai, bình luận, hộp thư
Nội dung ……… Bài viết, chuyên mục, media, widget trang chủ
Cộng đồng …… Sự kiện, quỹ công đức, khuyến học
Hệ thống ……… Tài khoản, cấu hình (SRS-12b), audit, module on/off
```

Quy ước UI: chỉ dùng component `packages/ui` cho pattern đã có; form = FormField + Zod; bảng = DataTable; ngày = DualDatePicker; **không hardcode màu** (Gate B).

### 6.3 Packages dùng chung

| Package | Vai trò |
|---------|---------|
| `@giapha/ui` | Design system + Storybook |
| `@giapha/tokens` | CSS variables / TS từ Style Dictionary |
| `@giapha/lunar` | Âm lịch TypeScript + golden tests |
| `@giapha/tree-viz` | React Flow + `layoutFamily` |
| `@giapha/auth` | oidc-client-ts wrapper |
| `@giapha/api-types` | Type sinh từ OpenAPI |

Nguồn token (source of truth): [`design-tokens/`](design-tokens/) (DTCG JSON). Figma chỉ để khám phá — không phải chân lý triển khai.

---

## 7. Chuẩn API

- Base: `/api/v1` · JSON · OpenAPI 3.1 (springdoc) → typegen FE
- Lỗi: RFC 9457 Problem Details
- Phân trang: keyset (`after` + `limit`)
- Idempotency-Key cho POST tài chính (donation)
- Mọi endpoint admin/nhạy cảm: `@RequiresPermission(...)` + test authz

Ví dụ nhóm endpoint (rút gọn — đầy đủ trong OpenAPI runtime):

```text
GET  /api/v1/trees/{slug}
GET  /api/v1/trees/{slug}/persons
GET  /api/v1/trees/{slug}/chart
GET  /api/v1/trees/{slug}/anniversaries?cal=lunar
GET  /api/v1/trees/{slug}/settings          # cấu hình công khai / admin (theo quyền)
POST /api/v1/trees/{slug}/change-requests
POST /api/v1/exports/tree-book
GET  /api/v1/posts
POST /api/v1/admin/persons
GET  /api/v1/system/modules
```

Chi tiết hợp đồng module & event: [`instruction/08-api-va-module-hoa.md`](instruction/08-api-va-module-hoa.md).

---

## 8. Stack & phiên bản

| Tầng | Công nghệ | Phiên bản mục tiêu |
|------|-----------|--------------------|
| Ngôn ngữ BE | Java (Temurin) | **21** |
| Framework BE | Spring Boot + Modulith | **4.x** / **2.x** |
| Scaffold | JHipster CLI | **9.2.x** |
| Build BE | Gradle | **9.x** |
| ORM / migrate | JPA + Liquibase | theo JHipster |
| Portal | Next.js + React | **15** / **19** |
| Admin | Vite + React + TS | hiện hành |
| State FE | TanStack Query + Zustand | v5 |
| Form | react-hook-form + Zod | — |
| Phả đồ | `@xyflow/react` + layout riêng | 12.x |
| DB | PostgreSQL | **16** |
| Search | Elasticsearch | **8.16+** |
| Cache | Redis | **7** |
| Object storage | MinIO | RELEASE hiện hành |
| IAM | Keycloak | **26.x** |
| Ảnh động | imgproxy | 3.x |
| PDF | pdf-render (Playwright) + OpenPDF | — |
| Secret config | jasypt-spring-boot | 3.x |
| CI | GitHub Actions | — |
| Node / pnpm | — | **22 LTS** / **9** |

Phương án thay thế & license từng thành phần: [`instruction/02-lua-chon-cong-nghe.md`](instruction/02-lua-chon-cong-nghe.md).

---

## 9. Cấu trúc monorepo

```text
.
├── backend/                      # API Spring Boot (Gradle)
│   ├── app.jdl / jdl/            # mô hình miền — nguồn sinh CRUD
│   ├── JHIPSTER_GENERATE.md      # bằng chứng CLI
│   └── src/main/java/vn/giapha/  # core, genealogy, cms, …
├── frontend/
│   ├── apps/portal/              # Next.js
│   ├── apps/admin/               # Vite CRM
│   ├── packages/                 # ui, tokens, lunar, auth, tree-viz, api-types
│   └── visual/                   # Gate C visual regression
├── design-tokens/                # DTCG JSON + lint Gate B
├── services/pdf-render/          # Node + Playwright
├── deploy/
│   ├── compose/                  # Profile A — một VPS
│   ├── remote/                   # Infra DEV trên server
│   └── scripts/tunnel-infra.sh   # SSH tunnel port cố định
├── instruction/                  # TK-00…TK-15 (+ mockups/)
├── SRS/                          # Đặc tả FR
├── shared/                       # Hợp đồng dùng chung (nếu có)
├── .github/workflows/            # ci.yml, build-publish.yml
├── CLAUDE.md                     # Luật AI agent / DoD
├── README.md                     # Tài liệu này (VI)
└── README.en.md                  # English
```

---

## 10. Yêu cầu môi trường

| Công cụ | Phiên bản | Ghi chú |
|---------|-----------|---------|
| Node.js | **≥ 22.18** | [`.nvmrc`](.nvmrc) |
| pnpm | **9.x** | workspace `frontend/` |
| Java | **21** | toolchain Gradle |
| Docker | tùy chọn | build/push image |
| `sshpass` | — | tunnel DEV bằng mật khẩu SSH |
| Git | gần đây | hooks CI local nếu có |

```bash
nvm use
java -version   # 21
pnpm -v         # 9.x
```

---

## 11. Bắt đầu nhanh (local DEV)

### 11.1 Hạ tầng remote + tunnel

Postgres / Redis / MinIO / Elasticsearch / Keycloak **không** chạy local mặc định — chạy trên server DEV (`deploy/remote/`). Máy laptop mở SSH tunnel port cố định:

```bash
cp .env.tunnel.local.example .env.tunnel.local
# Điền host/user/password SSH — KHÔNG commit file này

./deploy/scripts/tunnel-infra.sh start
./deploy/scripts/tunnel-infra.sh status

cp .env.local.example .env.local
# Điền DB/Redis/MinIO/ES/Keycloak trỏ localhost + port bên dưới
```

| Dịch vụ | Port local cố định |
|---------|-------------------|
| PostgreSQL | `15432` |
| Redis | `16379` |
| MinIO API | `19000` |
| Elasticsearch | `19200` |
| Keycloak | `18086` |

Nếu port bị chiếm: script/skill sẽ yêu cầu giải phóng rồi mở lại. Chi tiết: Cursor skill **`/infra-tunnel`**, [`deploy/remote/README.md`](deploy/remote/README.md).

### 11.2 Backend

```bash
cd backend

# (Khuyến nghị) export JASYPT_ENCRYPTOR_PASSWORD=... khi chạy app có ENC(...)
# Entity mới — bắt buộc CLI:
# npx generator-jhipster@9.2.0 jdl jdl/<file>.jdl --no-interactive

./gradlew                 # compile / boot theo cấu hình dự án
# hoặc: ./gradlew bootRun
```

OpenAPI / Actuator có sẵn theo scaffold JHipster. Realm Keycloak mẫu: `backend/src/main/docker/realm-config/`.

### 11.3 Design tokens + Frontend

```bash
cd design-tokens
npm install
npm run build
npm run lint:tokens          # Gate B

cd ../frontend
pnpm install

pnpm --filter @giapha/lunar test
pnpm --filter @giapha/tree-viz test
pnpm --filter @giapha/portal dev     # http://localhost:3000
pnpm --filter @giapha/admin dev      # Vite (thường :5173)
pnpm --filter @giapha/ui storybook   # :6006
```

OIDC cho từng app:

```bash
cp frontend/apps/admin/.env.example  frontend/apps/admin/.env.local
cp frontend/apps/portal/.env.example frontend/apps/portal/.env.local
# Authority mặc định tunnel: http://localhost:18086/realms/jhipster
```

Gợi ý biến (không commit giá trị thật): [`.env.local.example`](.env.local.example).

---

## 12. Quy trình phát triển

### 12.1 Nguyên tắc

1. Mọi task phải **trace về TK/FR** cụ thể (`instruction/`, `SRS/`) — không code “cho vui”.
2. Một PR ≈ một slice (một module hoặc một màn + gate liên quan).
3. UI: grounded generation từ `packages/ui` + tokens — không dịch pixel Figma thành styled-div trần.
4. Không claim “xong” khi thiếu bằng chứng gate (A/B/D tối thiểu; C/S khi đụng UI/auth).

### 12.2 Backend entity mới

```text
Viết JDL → jhipster jdl → commit artifact CLI
     → xếp package Modulith (api/ + events/)
     → @RequiresPermission + privacy filter + tests
     → ApplicationModules.verify() xanh
```

### 12.3 Frontend màn mới

```text
Spec/mockup → packages/ui + tokens → form Zod / DataTable
     → pnpm lint:tokens (Gate B)
     → test:a11y (Gate D) khi có
     → Storybook story + mapping doc (DoD component)
```

### 12.4 Âm lịch

Chỉ dùng `core.lunar` (Java) và `packages/lunar` (TS). Hai bản **cùng** bộ golden test vectors — không dùng lib lịch Trung Quốc.

Chi tiết quy trình AI: [`instruction/11-quy-trinh-phat-trien-voi-ai.md`](instruction/11-quy-trinh-phat-trien-voi-ai.md) · Luật agent: [`CLAUDE.md`](CLAUDE.md).

---

## 13. Cấu hình & bí mật

| Loại | Quy ước |
|------|---------|
| Secret máy local | `.env.local`, `.env.tunnel.local` — **gitignore** |
| Secret trong YAML ứng dụng | Jasypt `ENC(...)` |
| Master Jasypt | Chỉ env `JASYPT_ENCRYPTOR_PASSWORD` (không commit) |
| Template | `.env.local.example`, `.env.tunnel.local.example` |
| Settings runtime (SMTP password, Zalo secret…) | Lưu mã hóa trong meta settings; **GET API không trả plaintext secret** |

Cấm tự viết AES/crypto thay Jasypt. Diff chạm secret → security review + người duyệt thứ hai.

---

## 14. Chất lượng, gates & CI/CD

### 14.1 Cổng kiểm chứng (máy chặn)

| Gate | Việc | Ngưỡng |
|------|------|--------|
| **A** | Compile, unit, Modulith verify | fail → không merge |
| **B** | `lint:tokens` — cấm hex cứng ngoài tokens | fail |
| **C** | Playwright visual diff (`frontend/visual`) | theo TK-11 |
| **D** | axe a11y | theo TK-11 |
| **S** | gitleaks + Semgrep + Trivy CRITICAL | fail |

### 14.2 Workflows GitHub Actions

| Workflow | Vai trò |
|----------|---------|
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Job `backend`, `frontend` (Gate B + build), `security` |
| [`.github/workflows/build-publish.yml`](.github/workflows/build-publish.yml) | Build & push GHCR: `api`, `portal`, `admin` (tên image **lowercase**) |

Branch `main`: bảo vệ bằng status check + approval (xem TK-12). Preview/staging/production theo [`instruction/12-cau-hinh-ha-tang-cicd.md`](instruction/12-cau-hinh-ha-tang-cicd.md).

### 14.3 Chạy gate local (thường dùng)

```bash
cd design-tokens && npm run lint:tokens
cd ../frontend && pnpm --filter @giapha/lunar test
cd ../backend && ./gradlew compileJava test --tests '*UnitTest' --tests '*TechnicalStructureTest'
```

---

## 15. Bảo mật & riêng tư

### 15.1 Privacy tier (khác biệt quan trọng nhất)

| Đối tượng | Khách | Thành viên | Thư ký+ |
|-----------|-------|------------|---------|
| Người **đã khuất** | Đầy đủ (thờ phụng) | ✅ | ✅ |
| Người **còn sống** | Tên + đời (ẩn NS đầy đủ/SĐT/địa chỉ theo config) | Theo config họ | ✅ |
| Trẻ vị thành niên | Không | Chỉ nhánh mình | ✅ |

Export PDF/Excel tôn trọng tier theo vai người xuất. Serializer công khai **bắt buộc** qua privacy filter.

### 15.2 Kiểm soát kỹ thuật

- AuthN: OIDC + PKCE; 2FA bắt buộc role quản trị
- AuthZ: deny-by-default; ma trận role × permission trong CI
- Input: Bean Validation + Zod; không nối chuỗi SQL
- Upload: whitelist MIME + magic bytes; ảnh qua imgproxy
- Secrets: gitleaks; Jasypt cho config
- UI: **không** hiện jargon (OIDC, JWT, path API…) — rule `no-tech-jargon-on-ui`

Threat model STRIDE + ASVS: [`instruction/10-an-toan-thong-tin.md`](instruction/10-an-toan-thong-tin.md).

---

## 16. Triển khai & vận hành

### 16.1 Artifact

| Image / artifact | Nguồn |
|------------------|--------|
| `…/api` | `backend/Dockerfile` (Boot / JRE 21) |
| `…/portal` | Next.js standalone |
| `…/admin` | Vite static |
| `…/pdf` (tuỳ chọn) | `services/pdf-render` |

### 16.2 Profile triển khai

| Profile | Mô tả |
|---------|--------|
| **A — Một dòng họ, một VPS** | `deploy/compose/` — api + portal + admin + PG + Redis + MinIO + Keycloak + Nginx; ES bật khi đủ RAM |
| **B — SaaS nhiều họ** | Helm (giai đoạn sau) — HPA, RLS theo `tree_id`, custom domain |

### 16.3 Sao lưu (dữ liệu tổ tiên không thể mất)

| Đối tượng | Cơ chế | Mục tiêu |
|-----------|--------|----------|
| PostgreSQL | `pg_dump` (+ WAL profile B) | RPO ≤ 24h (A), diễn tập restore quý |
| MinIO | versioning + mirror | hàng ngày |
| Keycloak realm | `kc export` | hàng tuần |
| ES | snapshot hoặc rebuild từ PG | hàng ngày |

Chi tiết đóng gói, giám sát (OTel + LGTM), runbook: [`instruction/09-trien-khai-va-dong-goi.md`](instruction/09-trien-khai-va-dong-goi.md).

---

## 17. Tài liệu

### Thiết kế (`instruction/`)

| Mã | File | Nội dung |
|----|------|----------|
| TK-00 | [00-tong-quan.md](instruction/00-tong-quan.md) | Tổng quan, bản đồ yêu cầu |
| TK-01 | [01-kien-truc-he-thong.md](instruction/01-kien-truc-he-thong.md) | C4, Modulith, JHipster |
| TK-02 | [02-lua-chon-cong-nghe.md](instruction/02-lua-chon-cong-nghe.md) | Stack & thay thế |
| TK-03 | [03-thiet-ke-database.md](instruction/03-thiet-ke-database.md) | Schema, ERD, ES |
| TK-04 | [04-design-system-giao-dien.md](instruction/04-design-system-giao-dien.md) | Tokens, UI kit |
| TK-05 | [05-ke-thua-tinh-nang.md](instruction/05-ke-thua-tinh-nang.md) | Ma trận parity SRS |
| TK-06 | [06-tinh-nang-moi-de-xuat.md](instruction/06-tinh-nang-moi-de-xuat.md) | 10 tính năng mới |
| TK-07 | [07-crm-quan-tri-hien-dai.md](instruction/07-crm-quan-tri-hien-dai.md) | IA & UX Admin |
| TK-08 | [08-api-va-module-hoa.md](instruction/08-api-va-module-hoa.md) | API & event |
| TK-09 | [09-trien-khai-va-dong-goi.md](instruction/09-trien-khai-va-dong-goi.md) | Deploy, backup |
| TK-10 | [10-an-toan-thong-tin.md](instruction/10-an-toan-thong-tin.md) | ATTT, NĐ13 |
| TK-11 | [11-quy-trinh-phat-trien-voi-ai.md](instruction/11-quy-trinh-phat-trien-voi-ai.md) | Gates, learn loop |
| TK-12 | [12-cau-hinh-ha-tang-cicd.md](instruction/12-cau-hinh-ha-tang-cicd.md) | Infra & Actions |
| TK-13 | [13-ke-hoach-thuc-hien.md](instruction/13-ke-hoach-thuc-hien.md) | Checklist R0–R2 + **RP** |
| TK-14 | [14-glossary.md](instruction/14-glossary.md) | Thuật ngữ VN ↔ code |
| TK-15 | [15-figma-ds-gia-pha-ho-hoang.md](instruction/15-figma-ds-gia-pha-ho-hoang.md) | Figma DS |

Mockup HTML tham chiếu UI: [`instruction/mockups/`](instruction/mockups/).

### SRS & vận hành agent

- Mục lục FR: [`SRS/00-tong-hop.md`](SRS/00-tong-hop.md)
- Go-live: [`SRS/15-production-go-live.md`](SRS/15-production-go-live.md)
- Luật AI / Definition of Done: [`CLAUDE.md`](CLAUDE.md)

---

## 18. Trạng thái phát hành

| Giai đoạn | Phạm vi | Trạng thái |
|-----------|---------|------------|
| **R0** | Repo, CI, tokens, JHipster Boot 4, tunnel DEV | Khung hoàn thành |
| **R1** | Lõi genealogy, CMS, search, IAM, Portal/Admin CRM | Khung hoàn thành |
| **R2** | Donation, event, moderation, notify, PDF | Khung hoàn thành |
| **RP** | Parity mockup/SRS, SMTP/PII thật, bỏ stub đường chính, E2E, backup, go-live | **Đang thực hiện** |
| Sau go-live | Bản đồ mộ (F5), Hán-Nôm (F7), trợ lý AI (F9), SaaS multi-tenant | Hàng đợi — không chặn phát hành |

Theo dõi checkbox chi tiết trong [`instruction/13-ke-hoach-thuc-hien.md`](instruction/13-ke-hoach-thuc-hien.md).

---

## 19. Đóng góp nội bộ

1. Đọc TK/FR liên quan trước khi mở PR.
2. Entity: **JDL → CLI** trước mọi Java CRUD.
3. Commit message tiếng Việt: `[module] hành động — tham chiếu TK/FR`.
4. Không stage secret (`.env.local`, `.env.tunnel.local`, credential, pid tunnel…).
5. Sau đơn vị việc ổn định: commit + push theo rule repo (`.cursor/rules/commit-push-when-done.mdc`).
6. Diff auth / donation / privacy / upload: `/security-review` + duyệt thứ hai.
7. UI: không lộ tên công nghệ / client id / path API thô trên giao diện người dùng nghiệp vụ.

---

## 20. Giấy phép & liên hệ

**Giấy phép:** mã nguồn và tài liệu thuộc quyền sở hữu của chủ dự án. Không phân phối lại khi chưa có thỏa thuận bằng văn bản.

**Liên hệ:** mở issue trên repository hoặc liên hệ chủ sở hữu GitHub của tổ chức dự án.

---

*Tài liệu thiết kế chi tiết và SRS là nguồn chân lý nghiệp vụ; README này là cửa vào vận hành & định hướng cho contributor.*
