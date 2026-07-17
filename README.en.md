# GiaPhaHub

**Digital genealogy platform for Vietnamese lineages**

[Tiếng Việt](README.md) · [Design (TK)](instruction/00-tong-quan.md) · [SRS](SRS/00-tong-hop.md) · [Roadmap (RP)](instruction/13-ke-hoach-thuc-hien.md) · [AI rules](CLAUDE.md)

[![CI](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/ci.yml/badge.svg)](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/ci.yml)
[![Build & Publish](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/build-publish.yml/badge.svg)](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/build-publish.yml)
[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Node](https://img.shields.io/badge/Node-22%20LTS-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey)](#20-license--contact)

---

## Table of contents

1. [Introduction & context](#1-introduction--context)
2. [Personas](#2-personas)
3. [Product capabilities](#3-product-capabilities)
4. [System architecture](#4-system-architecture)
5. [Backend modules](#5-backend-modules)
6. [Frontend applications](#6-frontend-applications)
7. [API conventions](#7-api-conventions)
8. [Stack & versions](#8-stack--versions)
9. [Monorepo layout](#9-monorepo-layout)
10. [Prerequisites](#10-prerequisites)
11. [Quick start (local DEV)](#11-quick-start-local-dev)
12. [Development workflow](#12-development-workflow)
13. [Configuration & secrets](#13-configuration--secrets)
14. [Quality gates & CI/CD](#14-quality-gates--cicd)
15. [Security & privacy](#15-security--privacy)
16. [Deployment & operations](#16-deployment--operations)
17. [Documentation](#17-documentation)
18. [Release status](#18-release-status)
19. [Internal contributing](#19-internal-contributing)
20. [License & contact](#20-license--contact)

> **Note:** Design docs (`instruction/`) and SRS files are written primarily in **Vietnamese**. This README is the English entry point for architecture, setup, and contribution norms.

---

## 1. Introduction & context

**GiaPhaHub** is an end-to-end digital platform for **Vietnamese family lineages**: multi-generation trees, clan chronicles / bylaws / ancestral property records, lunar death anniversaries, a public clan portal, and a modern CRM for clan leaders and editorial boards.

### Why not a Western genealogy product?

International tools (GEDCOM-centric apps, webtrees, etc.) miss **first-class** Vietnamese clan needs:

| Vietnamese need | How GiaPhaHub addresses it |
|-----------------|----------------------------|
| Death anniversaries on the **lunar calendar** (leap months, stem-branch) | `core.lunar` (Java) + `packages/lunar` (TS), shared golden tests |
| Ancestor worship vs **living-person PII** | Lifecycle privacy tiers (Vietnam Decree 13/2023) |
| Merit funds, honor boards, scholarships, clan meetings | donation / scholarship / event modules |
| News portal + strong SEO like legacy clan sites | Next.js SSR portal + CMS |
| Usable by older clan leaders | Vietnamese CRM, large type, ≤ 3 clicks, DualDatePicker |

### Specification sources

- **SRS** under `SRS/` — reverse-engineered from a real Vietnamese clan site (NukeViet + genealogy module + heritage theme); sample observation ~1,500+ members / 13 generations.
- **System design** under `instruction/` (TK-00…TK-15) — architecture, DB, design system, security, CI/CD, roadmap R0→R2 + **RP production**.
- Product goal: **one codebase** for many lineages (multi-tenant via `tree_id`), deployable on a modest single VPS.

Current phase: after the R0–R2 framework, focus is **RP — production hardening** (mockup/SRS parity, real SMTP/PII, E2E, backup/restore, go-live). See [`instruction/13-ke-hoach-thuc-hien.md`](instruction/13-ke-hoach-thuc-hien.md).

---

## 2. Personas

| Actor | Primary goals | Channel |
|-------|---------------|---------|
| **Guest** | Browse the tree, look up deceased members, read news, view merit boards | Public portal |
| **Clan member** | Sign in, comment, self-submit branch profile changes, receive anniversary reminders | Portal + notifications |
| **Editorial board** | Draft/publish posts, albums, comments | Admin CRM |
| **Clan lead / genealogy secretary** | CRUD persons, edit the tree, anniversaries, approve self-submits, funds | Admin CRM |
| **System admin** | Site settings (SRS-12b ~13 groups), SMTP/Zalo, PII policy, accounts, backup | Admin → System |

CRM philosophy: *usable by a 70-year-old clan lead, delightful for a 20-year-old secretary* — see [`instruction/07-crm-quan-tri-hien-dai.md`](instruction/07-crm-quan-tri-hien-dai.md).

---

## 3. Product capabilities

### 3.1 Genealogy core

- Person profiles: name, gender, generation, member code, parent/spouse links, living/deceased status
- Unions, multi-generation trees, filters by branch / generation / status
- **Interactive chart**: pan/zoom, minimap, PNG/SVG export — React Flow + a custom layout engine (`packages/tree-viz`) that respects Vietnamese pairing and sibling order
- **Admin Tree Editor**: edit on canvas, +Child / +Spouse, drag-to-reparent with confirmation (SRS-12a)
- Book chapters: chronicles, bylaws, ancestral property
- Publishing: genealogy book PDF (pdf-render service / OpenPDF fallback), Excel lists

### 3.2 Lunar calendar & death anniversaries

- Solar ↔ lunar conversion, stem-branch, leap months (Hồ Ngọc Đức *amlich*, UTC+7)
- Anniversary calendar by lunar month; overrides; remind-N-days settings
- Admin dashboard KPI: anniversaries in the current lunar month
- Reminder channels: email (SMTP from TreeSettings), Zalo OA (per configured mode), web push

### 3.3 Public portal (CMS + media)

- Posts / categories / static pages, scheduled publish, comments
- Home page widgets (NukeViet block parity) configured via API
- Media library & albums (MinIO), on-the-fly resize (imgproxy)
- Notables, contact, site-wide + genealogy search (Elasticsearch, Vietnamese accent folding)

### 3.4 Community & funds

- **Donations / merit**: campaigns, contributions, honor board, statements / receipts
- **Events**: clan meetings, checklists, RSVP, attendance
- **Scholarships**: nominate → approve → publish
- **Self-submit (moderation)**: members send profile diffs → review queue → versioned apply into genealogy

### 3.5 Accounts, permissions, settings

- OIDC sign-in via Keycloak (TOTP 2FA for admin roles)
- RBAC as `module:entity:action` with `@RequiresPermission` on APIs
- Admin **Accounts** screen: list / approve / lock / assign roles / reset password / login history
- **System settings** (SRS-12b): ~13 setting groups (site, SMTP, Zalo, PII, feature flags…) — secrets never returned on GET

### 3.6 SRS map (document groups)

| Area | SRS files |
|------|-----------|
| Profiles & tree | [03](SRS/03-gia-pha-ho-so-thanh-vien.md), [04](SRS/04-pha-do-truc-quan.md), [05](SRS/05-ngay-gio-am-lich.md) |
| CMS & media | [06](SRS/06-tin-tuc-noi-dung.md), [08](SRS/08-thu-vien-album-anh.md) |
| Merit / search / accounts | [07](SRS/07-cong-duc.md), [09](SRS/09-tim-kiem.md), [10](SRS/10-thanh-vien-tai-khoan.md) |
| CRM & settings | [12](SRS/12-quan-tri-crm-an.md), [12a](SRS/12a-admin-soan-pha-do.md), [12b](SRS/12b-admin-cau-hinh.md) |
| Production | [15](SRS/15-production-go-live.md) |

Proposed Vietnam-native features: [`instruction/06-tinh-nang-moi-de-xuat.md`](instruction/06-tinh-nang-moi-de-xuat.md).

---

## 4. System architecture

### 4.1 Container view (simplified)

```text
                         Users
                              │
                              ▼
                     ┌────────────────┐
                     │  Nginx / Caddy │  TLS, HTTP/3, static cache
                     └────────┬───────┘
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
     Portal (Next.js)   Admin CRM (Vite)    imgproxy
      SSR / SEO           dense SPA              │
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
              pdf-render (Playwright) ← book export jobs
```

Full C4 diagrams and business sequences: [`instruction/01-kien-truc-he-thong.md`](instruction/01-kien-truc-he-thong.md).

### 4.2 Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend style | **Modular monolith** (Spring Modulith 2) | Single deployable artifact; module boundaries enforced by tests; split later if needed |
| Framework | **Spring Boot 4.x** / Java 21 | Current OSS line; no Boot 3 / JHipster 8 bootstrap |
| CRUD scaffolding | **JHipster 9** JDL (`--skip-client`) | Entities/repos/resources/DTOs/MapStruct/Liquibase from CLI; humans/AI write JDL + domain logic only |
| Two FE apps | Next.js portal + Vite admin | SEO vs dense UX; **no** JHipster client |
| Cross-module | Modulith events + outbox | No cross-module table queries |
| Multi-tenant | `tree_id` (+ RLS in SaaS phase) | One codebase, many lineages |
| YAML secrets | **Jasypt** `ENC(...)` | Master key via env only |

### 4.3 Representative flows

**Record death → anniversary + reminders**

1. Admin updates a person (deceased + lunar death date).
2. `genealogy` validates lunar dates (`core.lunar`), writes audit.
3. Event → `search` reindex; event → `notification` schedules reminders (email/Zalo).

**Self-submit → approval**

1. Member posts a change-request (diff for their branch).
2. `moderation` queues and assigns a secretary.
3. Approve → versioned apply in `genealogy` → notify outcome.

---

## 5. Backend modules

Root package: `vn.giapha.*`. Each Modulith module exposes only `api/` + `events/`; everything else is `internal/`.

| Module | Responsibility |
|--------|----------------|
| **core** | Shared kernel: tenant, lunar, security helpers, audit |
| **genealogy** | Person, union, chapter, anniversary, tree/book export |
| **cms** | Post, category, comment, page, honor board |
| **media** | Album, asset, MinIO adapter |
| **donation** | Campaign, contribution, statements |
| **event** | Clan events, RSVP, checklist, assignments |
| **notification** | Real SMTP from TreeSettings, Zalo OA, web push, outbox |
| **search** | Elasticsearch indexer + query API |
| **moderation** | Change-requests / self-submit |
| **iam** | Keycloak bridge, RBAC catalog, account administration |
| **scholarship** | Scholarships |
| **system** | Module registry, tree settings, operational health |

**Mandatory path for new entities**

1. Edit `backend/**/*.jdl`
2. Run `npx generator-jhipster@9 jdl … --no-interactive` inside `backend/`
3. Commit CLI-generated artifacts (Liquibase, MapStruct, …)
4. Only then add privacy / permissions / events / adapters

Hand-written “JHipster-style” CRUD or copying samples from other repos is forbidden. Evidence: [`backend/JHIPSTER_GENERATE.md`](backend/JHIPSTER_GENERATE.md).

---

## 6. Frontend applications

### 6.1 Portal — `@giapha/portal`

- Next.js 15 App Router, React 19, SSR/SSG for SEO & Open Graph
- Routes: home, tree, profiles, anniversaries, news, donations, self-submit, media library…
- Theme / site title from public TreeSettings
- OIDC via `packages/auth` (PKCE)

### 6.2 Admin CRM — `@giapha/admin`

Target information architecture:

```text
Dashboard
Genealogy …… Tree Editor, person list, chapters, anniversaries, publishing
Review ……… Self-submit, comments, contact inbox
Content ……… Posts, categories, media, home widgets
Community …… Events, merit funds, scholarships
System ……… Accounts, settings (SRS-12b), audit, module toggles
```

UI rules: reuse `packages/ui` for existing patterns; forms = FormField + Zod; tables = DataTable; dates = DualDatePicker; **no hardcoded colors** (Gate B).

### 6.3 Shared packages

| Package | Role |
|---------|------|
| `@giapha/ui` | Design system + Storybook |
| `@giapha/tokens` | CSS variables / TS from Style Dictionary |
| `@giapha/lunar` | TypeScript lunar calendar + golden tests |
| `@giapha/tree-viz` | React Flow + `layoutFamily` |
| `@giapha/auth` | oidc-client-ts wrapper |
| `@giapha/api-types` | Types generated from OpenAPI |

Token source of truth: [`design-tokens/`](design-tokens/) (DTCG JSON). Figma is for exploration — not the implementation authority.

---

## 7. API conventions

- Base: `/api/v1` · JSON · OpenAPI 3.1 (springdoc) → FE typegen
- Errors: RFC 9457 Problem Details
- Pagination: keyset (`after` + `limit`)
- Idempotency-Key for financial POSTs (donations)
- Every sensitive/admin endpoint: `@RequiresPermission(...)` + authz tests

Representative endpoints (full surface in runtime OpenAPI):

```text
GET  /api/v1/trees/{slug}
GET  /api/v1/trees/{slug}/persons
GET  /api/v1/trees/{slug}/chart
GET  /api/v1/trees/{slug}/anniversaries?cal=lunar
GET  /api/v1/trees/{slug}/settings
POST /api/v1/trees/{slug}/change-requests
POST /api/v1/exports/tree-book
GET  /api/v1/posts
POST /api/v1/admin/persons
GET  /api/v1/system/modules
```

Module contracts & events: [`instruction/08-api-va-module-hoa.md`](instruction/08-api-va-module-hoa.md).

---

## 8. Stack & versions

| Layer | Technology | Target version |
|-------|------------|----------------|
| BE language | Java (Temurin) | **21** |
| BE framework | Spring Boot + Modulith | **4.x** / **2.x** |
| Scaffolding | JHipster CLI | **9.2.x** |
| BE build | Gradle | **9.x** |
| ORM / migrate | JPA + Liquibase | per JHipster |
| Portal | Next.js + React | **15** / **19** |
| Admin | Vite + React + TS | current |
| FE state | TanStack Query + Zustand | v5 |
| Forms | react-hook-form + Zod | — |
| Tree viz | `@xyflow/react` + custom layout | 12.x |
| DB | PostgreSQL | **16** |
| Search | Elasticsearch | **8.16+** |
| Cache | Redis | **7** |
| Object storage | MinIO | current RELEASE |
| IAM | Keycloak | **26.x** |
| Images | imgproxy | 3.x |
| PDF | pdf-render (Playwright) + OpenPDF | — |
| Config secrets | jasypt-spring-boot | 3.x |
| CI | GitHub Actions | — |
| Node / pnpm | — | **22 LTS** / **9** |

Alternatives & licenses: [`instruction/02-lua-chon-cong-nghe.md`](instruction/02-lua-chon-cong-nghe.md).

---

## 9. Monorepo layout

```text
.
├── backend/                      # Spring Boot API (Gradle)
│   ├── app.jdl / jdl/            # domain model — CRUD source of truth
│   ├── JHIPSTER_GENERATE.md      # CLI evidence
│   └── src/main/java/vn/giapha/  # core, genealogy, cms, …
├── frontend/
│   ├── apps/portal/              # Next.js
│   ├── apps/admin/               # Vite CRM
│   ├── packages/                 # ui, tokens, lunar, auth, tree-viz, api-types
│   └── visual/                   # Gate C visual regression
├── design-tokens/                # DTCG JSON + Gate B lint
├── services/pdf-render/          # Node + Playwright
├── deploy/
│   ├── compose/                  # Profile A — single VPS
│   ├── remote/                   # DEV infra on remote server
│   └── scripts/tunnel-infra.sh   # fixed-port SSH tunnels
├── instruction/                  # TK-00…TK-15 (+ mockups/)
├── SRS/                          # Functional requirements
├── shared/                       # Shared contracts (when present)
├── .github/workflows/            # ci.yml, build-publish.yml
├── CLAUDE.md                     # AI agent rules / DoD
├── README.md                     # Vietnamese
└── README.en.md                  # This file
```

---

## 10. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | **≥ 22.18** | [`.nvmrc`](.nvmrc) |
| pnpm | **9.x** | `frontend/` workspace |
| Java | **21** | Gradle toolchain |
| Docker | optional | image build/push |
| `sshpass` | — | password SSH tunnel to DEV |
| Git | recent | — |

```bash
nvm use
java -version   # 21
pnpm -v         # 9.x
```

---

## 11. Quick start (local DEV)

### 11.1 Remote infra + tunnel

Postgres / Redis / MinIO / Elasticsearch / Keycloak do **not** run locally by default — they run on the DEV server (`deploy/remote/`). Your laptop opens fixed-port SSH tunnels:

```bash
cp .env.tunnel.local.example .env.tunnel.local
# Fill SSH host/user/password — NEVER commit this file

./deploy/scripts/tunnel-infra.sh start
./deploy/scripts/tunnel-infra.sh status

cp .env.local.example .env.local
# Point DB/Redis/MinIO/ES/Keycloak at localhost + ports below
```

| Service | Fixed local port |
|---------|------------------|
| PostgreSQL | `15432` |
| Redis | `16379` |
| MinIO API | `19000` |
| Elasticsearch | `19200` |
| Keycloak | `18086` |

If a port is busy, free it and restart the tunnel. Details: Cursor skill **`/infra-tunnel`**, [`deploy/remote/README.md`](deploy/remote/README.md).

### 11.2 Backend

```bash
cd backend

# (Recommended) export JASYPT_ENCRYPTOR_PASSWORD=... when running with ENC(...)
# New entities — CLI required:
# npx generator-jhipster@9.2.0 jdl jdl/<file>.jdl --no-interactive

./gradlew                 # compile / boot per project config
# or: ./gradlew bootRun
```

OpenAPI / Actuator come from the JHipster scaffold. Sample Keycloak realm: `backend/src/main/docker/realm-config/`.

### 11.3 Design tokens + frontend

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
pnpm --filter @giapha/admin dev      # Vite (typically :5173)
pnpm --filter @giapha/ui storybook   # :6006
```

OIDC per app:

```bash
cp frontend/apps/admin/.env.example  frontend/apps/admin/.env.local
cp frontend/apps/portal/.env.example frontend/apps/portal/.env.local
# Default tunnel authority: http://localhost:18086/realms/jhipster
```

Variable hints (never commit real secrets): [`.env.local.example`](.env.local.example).

---

## 12. Development workflow

### 12.1 Principles

1. Every task must **trace to a concrete TK/FR** (`instruction/`, `SRS/`) — no orphan coding.
2. One PR ≈ one slice (one module or one screen + related gates).
3. UI: grounded generation from `packages/ui` + tokens — do not translate Figma pixels into bare styled divs.
4. Do not claim “done” without gate evidence (A/B/D minimum; C/S when touching UI/auth).

### 12.2 New backend entities

```text
Write JDL → jhipster jdl → commit CLI artifacts
     → Modulith packages (api/ + events/)
     → @RequiresPermission + privacy filter + tests
     → ApplicationModules.verify() green
```

### 12.3 New frontend screens

```text
Spec/mockup → packages/ui + tokens → Zod forms / DataTable
     → pnpm lint:tokens (Gate B)
     → test:a11y (Gate D) when available
     → Storybook story + mapping doc (component DoD)
```

### 12.4 Lunar calendar

Use only `core.lunar` (Java) and `packages/lunar` (TS). Both share the **same** golden vectors — do not use China-centric lunar libraries.

AI process details: [`instruction/11-quy-trinh-phat-trien-voi-ai.md`](instruction/11-quy-trinh-phat-trien-voi-ai.md) · Agent rules: [`CLAUDE.md`](CLAUDE.md).

---

## 13. Configuration & secrets

| Kind | Convention |
|------|------------|
| Local secrets | `.env.local`, `.env.tunnel.local` — **gitignored** |
| Secrets in app YAML | Jasypt `ENC(...)` |
| Jasypt master | Env only: `JASYPT_ENCRYPTOR_PASSWORD` (never commit) |
| Templates | `.env.local.example`, `.env.tunnel.local.example` |
| Runtime settings (SMTP password, Zalo secret…) | Encrypted in settings meta; **GET APIs never return plaintext secrets** |

Do not invent custom AES/crypto instead of Jasypt. Diffs touching secrets require a security review and a second approver.

---

## 14. Quality gates & CI/CD

### 14.1 Machine-enforced gates

| Gate | What it checks | Threshold |
|------|----------------|-----------|
| **A** | Compile, unit, Modulith verify | fail → no merge |
| **B** | `lint:tokens` — no hardcoded hex outside tokens | fail |
| **C** | Playwright visual diff (`frontend/visual`) | per TK-11 |
| **D** | axe a11y | per TK-11 |
| **S** | gitleaks + Semgrep + Trivy CRITICAL | fail |

### 14.2 GitHub Actions workflows

| Workflow | Role |
|----------|------|
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Jobs `backend`, `frontend` (Gate B + build), `security` |
| [`.github/workflows/build-publish.yml`](.github/workflows/build-publish.yml) | Build & push GHCR: `api`, `portal`, `admin` (**lowercase** image names) |

`main` is protected by status checks + approval (see TK-12). Preview/staging/production: [`instruction/12-cau-hinh-ha-tang-cicd.md`](instruction/12-cau-hinh-ha-tang-cicd.md).

### 14.3 Common local gate commands

```bash
cd design-tokens && npm run lint:tokens
cd ../frontend && pnpm --filter @giapha/lunar test
cd ../backend && ./gradlew compileJava test --tests '*UnitTest' --tests '*TechnicalStructureTest'
```

---

## 15. Security & privacy

### 15.1 Privacy tiers (the critical differentiator)

| Subject | Guest | Member | Secretary+ |
|---------|-------|--------|------------|
| **Deceased** | Full (worship / research) | ✅ | ✅ |
| **Living** | Name + generation (hide full DOB/phone/address per config) | Per clan config | ✅ |
| **Minors** | No | Own branch only | ✅ |

PDF/Excel export respects the exporter’s role. Public serializers **must** pass the privacy filter.

### 15.2 Technical controls

- AuthN: OIDC + PKCE; 2FA required for admin roles
- AuthZ: deny-by-default; role × permission matrix in CI
- Input: Bean Validation + Zod; no string-concatenated SQL
- Upload: MIME + magic-byte whitelist; images via imgproxy
- Secrets: gitleaks; Jasypt for config
- UI: **no** technical jargon for business users (OIDC, JWT, raw API paths…) — rule `no-tech-jargon-on-ui`

STRIDE threat model + ASVS: [`instruction/10-an-toan-thong-tin.md`](instruction/10-an-toan-thong-tin.md).

---

## 16. Deployment & operations

### 16.1 Artifacts

| Image / artifact | Source |
|------------------|--------|
| `…/api` | `backend/Dockerfile` (Boot / JRE 21) |
| `…/portal` | Next.js standalone |
| `…/admin` | Vite static |
| `…/pdf` (optional) | `services/pdf-render` |

### 16.2 Deployment profiles

| Profile | Description |
|---------|-------------|
| **A — One lineage, one VPS** | `deploy/compose/` — api + portal + admin + PG + Redis + MinIO + Keycloak + Nginx; enable ES when RAM allows |
| **B — Multi-lineage SaaS** | Helm (later) — HPA, RLS by `tree_id`, custom domains |

### 16.3 Backup (ancestral data cannot be lost)

| Target | Mechanism | Goal |
|--------|-----------|------|
| PostgreSQL | `pg_dump` (+ WAL on profile B) | RPO ≤ 24h (A), quarterly restore drills |
| MinIO | versioning + mirror | daily |
| Keycloak realm | `kc export` | weekly |
| ES | snapshot or rebuild from PG | daily |

Packaging, monitoring (OTel + LGTM), runbooks: [`instruction/09-trien-khai-va-dong-goi.md`](instruction/09-trien-khai-va-dong-goi.md).

---

## 17. Documentation

### Design (`instruction/`) — Vietnamese

| ID | File | Topic |
|----|------|-------|
| TK-00 | [00-tong-quan.md](instruction/00-tong-quan.md) | Overview, requirements map |
| TK-01 | [01-kien-truc-he-thong.md](instruction/01-kien-truc-he-thong.md) | C4, Modulith, JHipster |
| TK-02 | [02-lua-chon-cong-nghe.md](instruction/02-lua-chon-cong-nghe.md) | Stack & alternatives |
| TK-03 | [03-thiet-ke-database.md](instruction/03-thiet-ke-database.md) | Schema, ERD, ES |
| TK-04 | [04-design-system-giao-dien.md](instruction/04-design-system-giao-dien.md) | Tokens, UI kit |
| TK-05 | [05-ke-thua-tinh-nang.md](instruction/05-ke-thua-tinh-nang.md) | SRS parity matrix |
| TK-06 | [06-tinh-nang-moi-de-xuat.md](instruction/06-tinh-nang-moi-de-xuat.md) | 10 new features |
| TK-07 | [07-crm-quan-tri-hien-dai.md](instruction/07-crm-quan-tri-hien-dai.md) | Admin IA & UX |
| TK-08 | [08-api-va-module-hoa.md](instruction/08-api-va-module-hoa.md) | API & events |
| TK-09 | [09-trien-khai-va-dong-goi.md](instruction/09-trien-khai-va-dong-goi.md) | Deploy, backup |
| TK-10 | [10-an-toan-thong-tin.md](instruction/10-an-toan-thong-tin.md) | Security, Decree 13 |
| TK-11 | [11-quy-trinh-phat-trien-voi-ai.md](instruction/11-quy-trinh-phat-trien-voi-ai.md) | Gates, learn loop |
| TK-12 | [12-cau-hinh-ha-tang-cicd.md](instruction/12-cau-hinh-ha-tang-cicd.md) | Infra & Actions |
| TK-13 | [13-ke-hoach-thuc-hien.md](instruction/13-ke-hoach-thuc-hien.md) | Checklist R0–R2 + **RP** |
| TK-14 | [14-glossary.md](instruction/14-glossary.md) | VN ↔ code glossary |
| TK-15 | [15-figma-ds-gia-pha-ho-hoang.md](instruction/15-figma-ds-gia-pha-ho-hoang.md) | Figma DS |

UI HTML mockups: [`instruction/mockups/`](instruction/mockups/).

### SRS & agent ops

- FR index: [`SRS/00-tong-hop.md`](SRS/00-tong-hop.md)
- Go-live: [`SRS/15-production-go-live.md`](SRS/15-production-go-live.md)
- AI rules / Definition of Done: [`CLAUDE.md`](CLAUDE.md)

---

## 18. Release status

| Phase | Scope | Status |
|-------|--------|--------|
| **R0** | Repo, CI, tokens, JHipster Boot 4, DEV tunnel | Framework complete |
| **R1** | Genealogy core, CMS, search, IAM, Portal/Admin CRM | Framework complete |
| **R2** | Donation, event, moderation, notify, PDF | Framework complete |
| **RP** | Mockup/SRS parity, real SMTP/PII, remove stubs on main paths, E2E, backup, go-live | **In progress** |
| Post go-live | Grave map (F5), Hán-Nôm (F7), AI assistant (F9), multi-tenant SaaS | Backlog — does not block release |

Detailed checkboxes: [`instruction/13-ke-hoach-thuc-hien.md`](instruction/13-ke-hoach-thuc-hien.md).

---

## 19. Internal contributing

1. Read the related TK/FR before opening a PR.
2. Entities: **JDL → CLI** before any Java CRUD.
3. Commit messages in Vietnamese: `[module] action — TK/FR reference`.
4. Never stage secrets (`.env.local`, `.env.tunnel.local`, credentials, tunnel pid files…).
5. After a stable delivery unit: commit + push per repo rule (`.cursor/rules/commit-push-when-done.mdc`).
6. Diffs touching auth / donation / privacy / upload: `/security-review` + second approver.
7. UI: do not expose technology names / client IDs / raw API paths to business users.

---

## 20. License & contact

**License:** source code and documentation are proprietary to the project owner. Redistribution requires a prior written agreement.

**Contact:** open a repository issue or contact the GitHub organization owner.

---

*Design docs and SRS are the business source of truth; this README is the operational entry point for contributors.*
