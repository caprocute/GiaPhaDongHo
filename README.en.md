# GiaPhaHub

**Digital genealogy platform for Vietnamese lineages**

[Tiếng Việt](README.md) · [Design (TK)](instruction/00-tong-quan.md) · [SRS](SRS/00-tong-hop.md) · [Roadmap](instruction/13-ke-hoach-thuc-hien.md)

[![CI](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/ci.yml/badge.svg)](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/ci.yml)
[![Build & Publish](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/build-publish.yml/badge.svg)](https://github.com/caprocute/GiaPhaDongHo/actions/workflows/build-publish.yml)
[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Node](https://img.shields.io/badge/Node-22%20LTS-green?logo=node.js)](https://nodejs.org/)

---

## Overview

GiaPhaHub digitizes **family trees, clan chronicles, lunar death anniversaries, a public portal, and modern CRM** for Vietnamese lineages — not a Western genealogy product with a language pack.

| Audience | Application |
|----------|-------------|
| Guests & members | **Portal** (Next.js) — SEO, tree viz, news, donations, self-registration |
| Clan leads / editors | **Admin CRM** (Vite React) — moderation, settings, funds, events, accounts |
| Platform | **API** (Spring Boot 4 + Modulith) + Keycloak, Postgres, Elasticsearch, MinIO, Redis |

One codebase serves multiple family trees (multi-tenant via `tree_id`). Current focus: **RP — production hardening** (SRS/mockup parity, real SMTP/PII, go-live).

---

## Key capabilities

- **Genealogy core** — persons, unions, generations, member codes, interactive tree
- **Vietnamese-first culture** — lunar calendar / stem-branch, death anniversaries, reminders, merit funds, scholarships
- **Public portal** — news, notices, media library, notables
- **Admin CRM** — system settings, self-submit review, events & RSVP, donation campaigns
- **Identity & access** — enterprise sign-in, 2FA, role-based permissions
- **Search** — Elasticsearch with Vietnamese accent-insensitive analysis
- **Publishing** — genealogy book PDF (pdf-render / OpenPDF)
- **Privacy** — living persons are PII (Vietnam Decree 13/2023); lifecycle-aware filters

Legacy feature map: [`SRS/00-tong-hop.md`](SRS/00-tong-hop.md) · New proposals: [`instruction/06-tinh-nang-moi-de-xuat.md`](instruction/06-tinh-nang-moi-de-xuat.md)

---

## Architecture

```text
                    ┌─────────────┐
  Users       ───►  │  Nginx/TLS  │
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

| Decision | Choice |
|----------|--------|
| Backend style | Modular monolith — **Spring Modulith 2** on **Spring Boot 4** / Java 21 |
| CRUD scaffolding | **JHipster 9** (JDL, `--skip-client`) — no hand-written entity boilerplate |
| Frontend | Portal SSR + Admin SPA (JHipster client disabled) |
| IAM | Keycloak 26 · JWT verification at the API |
| Config secrets | **Jasypt** `ENC(...)` + `JASYPT_ENCRYPTOR_PASSWORD` |

Full C4 diagrams: [`instruction/01-kien-truc-he-thong.md`](instruction/01-kien-truc-he-thong.md)

---

## Technology stack

| Layer | Technologies |
|-------|----------------|
| API | Java 21, Spring Boot 4.x, Spring Modulith, JPA, Liquibase, springdoc OpenAPI |
| Portal | Next.js 15, React 19, TypeScript |
| Admin | Vite, React 19, TypeScript, TanStack Query |
| UI | DTCG design tokens → Style Dictionary, `packages/ui`, Tailwind |
| Data | PostgreSQL 16, Elasticsearch 8, Redis 7, MinIO |
| Media | imgproxy · pdf-render (Playwright) |
| CI/CD | GitHub Actions · GHCR · quality gates A/B/C/D/S |
| Observability | OpenTelemetry + Grafana LGTM (per TK-09) |

Version & license matrix: [`instruction/02-lua-chon-cong-nghe.md`](instruction/02-lua-chon-cong-nghe.md)

---

## Repository layout

```text
.
├── backend/                 # Spring Boot API (Gradle) + JDL
├── frontend/
│   ├── apps/portal/         # Public portal (Next.js)
│   ├── apps/admin/          # Admin CRM (Vite)
│   ├── packages/ui|tokens|lunar|auth|tree-viz|…
│   └── visual/              # Gate C — visual regression
├── design-tokens/           # DTCG token source + Gate B
├── services/pdf-render/     # Headless PDF export
├── deploy/                  # Compose, remote infra, tunnel scripts
├── instruction/             # Design docs TK-00…TK-15 (Vietnamese)
├── SRS/                     # Functional requirements (FR)
├── shared/                  # Shared contracts (when present)
├── CLAUDE.md                # AI agent working rules
└── README.md / README.en.md
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | **22.18+** (see [`.nvmrc`](.nvmrc)) |
| pnpm | 9.x |
| Java | **21** (Temurin / Gradle toolchain) |
| Docker | optional (image builds) |
| `sshpass` | password-based SSH tunnel to DEV infra |

```bash
nvm use
```

---

## Quick start (local DEV)

### 1. Remote infra via SSH tunnel

Postgres, Redis, MinIO, Elasticsearch, and Keycloak run on the DEV server — your laptop only opens tunnels:

```bash
cp .env.tunnel.local.example .env.tunnel.local   # fill SSH — never commit
./deploy/scripts/tunnel-infra.sh start
./deploy/scripts/tunnel-infra.sh status

cp .env.local.example .env.local                 # point apps at localhost tunnel ports
```

| Service | Local port |
|---------|------------|
| PostgreSQL | `15432` |
| Redis | `16379` |
| MinIO | `19000` |
| Elasticsearch | `19200` |
| Keycloak | `18086` |

Details: Cursor skill `/infra-tunnel` · [`deploy/remote/README.md`](deploy/remote/README.md)

### 2. Backend

```bash
cd backend
# New entities: edit jdl/*.jdl, then run the JHipster CLI (do not hand-write CRUD)
# npx generator-jhipster@9.2.0 jdl jdl/<file>.jdl --no-interactive
./gradlew
```

Generation evidence: [`backend/JHIPSTER_GENERATE.md`](backend/JHIPSTER_GENERATE.md)

### 3. Frontend

```bash
cd design-tokens && npm install && npm run build && npm run lint:tokens
cd ../frontend && pnpm install

pnpm --filter @giapha/lunar test
pnpm --filter @giapha/portal dev    # http://localhost:3000
pnpm --filter @giapha/admin dev     # Vite (typically :5173)
pnpm --filter @giapha/ui storybook  # :6006
```

OIDC for FE apps: copy `frontend/apps/*/.env.example` → `.env.local` (see notes in [`.env.local.example`](.env.local.example)).

---

## Configuration & secrets

| Kind | Convention |
|------|------------|
| Runtime secrets | `.env.local`, `.env.tunnel.local` — **gitignored, never commit** |
| App YAML secrets | Jasypt `ENC(...)` · master key `JASYPT_ENCRYPTOR_PASSWORD` |
| Templates | `.env.local.example`, `.env.tunnel.local.example` |

Never store passwords, tokens, or encryption keys in git.

---

## Quality & CI

UI and feature work must pass machine-checked gates (no vibe coding):

| Gate | Purpose |
|------|---------|
| **A** | Build / unit / compile |
| **B** | `lint:tokens` — no hardcoded hex outside token packages |
| **C** | Visual diff (`frontend/visual`) |
| **D** | Accessibility (axe) |
| **S** | Gitleaks, Semgrep, Trivy (CRITICAL fails the job) |

Workflows:

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — backend, frontend, security
- [`.github/workflows/build-publish.yml`](.github/workflows/build-publish.yml) — GHCR images (`api`, `portal`, `admin`)

AI workflow + gates: [`instruction/11-quy-trinh-phat-trien-voi-ai.md`](instruction/11-quy-trinh-phat-trien-voi-ai.md)

---

## Security & privacy

- **Living persons** are PII — serializers/exports must go through the privacy filter
- Diffs touching auth / donation / privacy / uploads require a security review and a second approver
- Threat model & ASVS: [`instruction/10-an-toan-thong-tin.md`](instruction/10-an-toan-thong-tin.md)
- End-user UI must not expose technical jargon (OIDC, JWT, raw API paths…) — see `.cursor/rules/no-tech-jargon-on-ui.mdc`

---

## Documentation

Design and SRS documents are primarily in **Vietnamese**. Use the index below; English summaries live in this README.

| Document | Description |
|----------|-------------|
| [instruction/00-tong-quan.md](instruction/00-tong-quan.md) | System design overview (TK-00) |
| [instruction/01-kien-truc-he-thong.md](instruction/01-kien-truc-he-thong.md) | C4 architecture, monorepo |
| [instruction/02-lua-chon-cong-nghe.md](instruction/02-lua-chon-cong-nghe.md) | Stack & alternatives |
| [instruction/03-thiet-ke-database.md](instruction/03-thiet-ke-database.md) | Schema, ERD |
| [instruction/07-crm-quan-tri-hien-dai.md](instruction/07-crm-quan-tri-hien-dai.md) | CRM design |
| [instruction/09-trien-khai-va-dong-goi.md](instruction/09-trien-khai-va-dong-goi.md) | Packaging, monitoring, backup |
| [instruction/12-cau-hinh-ha-tang-cicd.md](instruction/12-cau-hinh-ha-tang-cicd.md) | Infra & CI/CD |
| [instruction/13-ke-hoach-thuc-hien.md](instruction/13-ke-hoach-thuc-hien.md) | Checklist R0→R2 + **RP production** |
| [instruction/14-glossary.md](instruction/14-glossary.md) | VN ↔ code glossary |
| [SRS/00-tong-hop.md](SRS/00-tong-hop.md) | Inherited FR specification |
| [SRS/15-production-go-live.md](SRS/15-production-go-live.md) | Go-live SRS |
| [CLAUDE.md](CLAUDE.md) | AI agent rules / Definition of Done |

---

## Contributing (internal)

1. One PR ≈ one slice (one module or one screen + related tests/gates)
2. New entities: **JDL → `jhipster jdl` first**; add domain logic / Modulith only after generation
3. UI: use `packages/ui` + design tokens; forms → Zod; tables → DataTable; dates → DualDatePicker
4. Commit messages in Vietnamese: `[module] action — TK/FR reference`
5. After a stable delivery unit: commit + push (see `.cursor/rules/commit-push-when-done.mdc`)

---

## Release status

| Phase | Scope |
|-------|--------|
| R0–R2 | Foundation, genealogy core, CMS, donations/events/notifications — framework complete |
| **RP** | Mockup/SRS parity, real SMTP/PII, E2E, backup/restore, go-live |
| Post go-live | Grave map, Hán-Nôm heritage, AI assistant, multi-tenant SaaS (does not block release) |

Track progress: [`instruction/13-ke-hoach-thuc-hien.md`](instruction/13-ke-hoach-thuc-hien.md)

---

## License

Source code and documentation are proprietary to the project owner. Redistribution requires a prior written agreement.

---

## Contact

For engineering or operations issues, open a repository issue or contact the GitHub organization owner.
