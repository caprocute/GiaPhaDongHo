# TK-12 — Cấu hình hạ tầng theo giai đoạn & CI/CD GitHub

> Chi tiết hóa TK-09. Phạm vi: cấu hình máy chủ cho **dev / staging / production**, biến môi trường,
> và bộ CI/CD hoàn chỉnh trên **GitHub Actions** (build → gates → deploy) kèm các bước thiết lập.

## 1. Ma trận môi trường

| | DEV (máy lập trình viên) | STAGING (VPS nhỏ) | PRODUCTION (1 dòng họ) |
|---|---|---|---|
| Mục đích | code + test cục bộ | preview cho designer/tộc trưởng duyệt, chạy E2E/ZAP | phục vụ thật |
| Nguồn chạy | `docker compose --profile dev` + hot-reload | auto deploy mỗi lần merge `main` | deploy theo tag `v*` có phê duyệt |
| Cỡ máy | Laptop ≥16GB RAM (8GB được nếu tắt ES) | 2 vCPU · 4GB · 60GB SSD | **4 vCPU · 8GB · 160GB NVMe** (thoải mái: 16GB) |
| Elasticsearch | tắt mặc định (PG FTS fallback) | tắt hoặc 1 node heap 512MB | 1 node heap 1–2GB |
| Keycloak | dev-mode (`start-dev`), realm import sẵn | như prod, DB chung Postgres | `start --optimized`, schema riêng |
| TLS | không (localhost) | Caddy/certbot Let's Encrypt | Let's Encrypt + HSTS |
| Dữ liệu | seed mẫu (SRS: 1.586 người ẩn danh hóa) | bản sao prod đã **mask PII** | thật + backup TK-09 §4 |
| Observability | console log | Loki nhẹ | LGTM stack đầy đủ |

### Phân bổ RAM production 8GB (limit đặt trong compose)

| Service | RAM limit | Ghi chú |
|---|---|---|
| PostgreSQL 16 | 1.5GB | `shared_buffers=512MB`, `max_connections=80` |
| API Spring Boot | 1.5GB | `-XX:MaxRAMPercentage=70`, virtual threads |
| Elasticsearch | 2GB | `ES_JAVA_OPTS=-Xms1g -Xmx1g`, 1 shard/index |
| Keycloak | 768MB | |
| Portal Next.js | 512MB | |
| MinIO | 512MB | |
| Redis | 256MB | `maxmemory 200mb allkeys-lru` |
| Nginx + imgproxy + pdf-render | ~700MB | pdf-render bật theo nhu cầu (scale-to-zero) |
| Hệ điều hành + dư | ~300MB + swap 2GB | swap để tránh OOM đột biến |

> VPS gợi ý tại VN: Vultr/DO Singapore hoặc VNPT/Viettel Cloud 4vCPU-8GB (~600–900k đ/tháng). Staging có thể là droplet 4GB (~250k đ/tháng) — tắt được khi không dùng.

## 2. Cấu trúc thư mục deploy & biến môi trường

```
deploy/
├── compose/
│   ├── docker-compose.base.yml      # định nghĩa chung mọi service (image, network, volume)
│   ├── docker-compose.dev.yml       # override: bind-mount source, hot-reload, port mở, ES tắt
│   ├── docker-compose.staging.yml   # override: limits nhỏ, basic-auth chắn ngoài, mask-data job
│   ├── docker-compose.prod.yml      # override: limits §1, restart:always, log rotation
│   ├── .env.example                 # TOÀN BỘ biến, chú thích tiếng Việt, không có giá trị thật
│   └── nginx/ (conf.d, snippets tls, cache imgproxy)
├── scripts/
│   ├── deploy.sh                    # pull image tag → migrate → up -d → healthcheck → prune
│   ├── rollback.sh                  # trở về tag trước đó (image + không rollback DB)
│   ├── backup.sh / restore.sh       # TK-09 §4
│   └── seed-dev.sh                  # nạp dữ liệu mẫu ẩn danh
└── runbooks/ (restore.md, incident.md, upgrade.md)
```

**Quy tắc biến môi trường** (12-factor):
- Server giữ file `/opt/giapha/.env` (chmod 600, không nằm trong git); CI không chứa secret ứng dụng — chỉ chứa khóa SSH deploy.
- Nhóm biến chính: `DB_*`, `REDIS_URL`, `ES_URL` (rỗng = dùng PG FTS), `MINIO_*`, `KC_*` (issuer, client), `SMTP_*`, `ZALO_OA_*`, `IMGPROXY_KEY/SALT`, `APP_BASE_URL`, `SENTRY_DSN` (tùy chọn).
- Spring profile: `dev` / `staging` / `prod` — bật tắt swagger-ui, log level, seed.

## 3. Nhánh & luồng phát hành (GitHub Flow + tag)

```
feature/* ──PR──▶ main ──auto──▶ STAGING ──tag v1.x.y (approve)──▶ PRODUCTION
```

- `main` được bảo vệ: bắt buộc PR + 1 review + toàn bộ checks xanh; cấm force-push.
- Preview: mỗi PR có job dựng compose ephemeral (hoặc chỉ portal lên Vercel preview) cho designer review (TK-11 gate "review trên bản chạy thật").
- Hotfix: nhánh `hotfix/*` từ tag → PR vào `main` → tag patch ngay.

## 4. Bộ workflow GitHub Actions

```
.github/workflows/
├── ci.yml                # PR + push main: Gate A/B/D + S (bắt buộc để merge)
├── visual.yml            # Gate C: Playwright visual regression (PR có nhãn ui hoặc đổi packages/ui)
├── build-publish.yml     # main + tag: build & push image lên GHCR (đa artifact, cache)
├── deploy-staging.yml    # sau build-publish trên main: SSH deploy staging + E2E smoke + ZAP baseline
├── deploy-production.yml # tag v*: chờ approve (environment) → deploy → healthcheck → thông báo
└── nightly.yml           # drift audit tokens (TK-11), dependency check, backup verify
```

### 4.1 `ci.yml` — cổng kiểm chứng PR (rút gọn nhưng chạy được)

```yaml
name: CI
on:
  pull_request:
  push: { branches: [main] }
concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }

jobs:
  backend:                            # GATE A (BE) + ArchUnit/Modulith
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: giapha }
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready" --health-interval 5s --health-retries 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: "21", cache: gradle }
      - run: ./gradlew check modulithVerify jacocoTestReport --no-daemon
        working-directory: backend

  frontend:                           # GATE A (FE) + GATE B (token lint) + GATE D (a11y)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm, cache-dependency-path: frontend/pnpm-lock.yaml }
      - run: pnpm install --frozen-lockfile
        working-directory: frontend
      - run: pnpm tokens:build && pnpm lint && pnpm lint:tokens   # Gate B — chặn hex/px trần
        working-directory: frontend
      - run: pnpm test && pnpm build
        working-directory: frontend
      - run: pnpm test:a11y                                        # Gate D — axe trên Storybook
        working-directory: frontend

  security:                           # GATE S (TK-10 §4)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2                          # secret lộ → fail
      - uses: returntocorp/semgrep-action@v1
        with: { config: "p/java p/react p/owasp-top-ten .semgrep/giapha.yml" }
      - uses: aquasecurity/trivy-action@master                     # CVE deps + config
        with: { scan-type: fs, severity: HIGH,CRITICAL, exit-code: "1" }
```

### 4.2 `visual.yml` — Gate C

```yaml
name: Visual Regression
on:
  pull_request:
    paths: ["frontend/packages/ui/**", "frontend/apps/**", "design-tokens/**"]
jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm, cache-dependency-path: frontend/pnpm-lock.yaml }
      - run: pnpm install --frozen-lockfile && pnpm exec playwright install --with-deps chromium
        working-directory: frontend
      - run: pnpm test:visual        # so screenshot với baseline trong repo; lệch >0.1% → fail
        working-directory: frontend
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: visual-diff, path: frontend/test-results }   # PR nào lệch phải giải trình
```

### 4.3 `build-publish.yml` — đóng gói lên GHCR

```yaml
name: Build & Publish
on:
  push:
    branches: [main]
    tags: ["v*"]
permissions: { contents: read, packages: write }
env: { REGISTRY: ghcr.io, NS: ghcr.io/${{ github.repository }} }

jobs:
  api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: "21", cache: gradle }
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }
      - run: ./gradlew bootBuildImage --imageName=$NS/api:${{ github.ref_name }} --publishImage
        working-directory: backend

  web:                                # portal + admin + pdf-render: buildx matrix
    runs-on: ubuntu-latest
    strategy:
      matrix: { app: [portal, admin, pdf-render] }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }
      - uses: docker/build-push-action@v6
        with:
          context: frontend
          file: frontend/apps/${{ matrix.app }}/Dockerfile
          push: true
          tags: ${{ env.NS }}/${{ matrix.app }}:${{ github.ref_name }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 4.4 `deploy-staging.yml` & `deploy-production.yml`

```yaml
name: Deploy Staging
on:
  workflow_run:
    workflows: ["Build & Publish"]
    types: [completed]
    branches: [main]
jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    environment: staging               # URL hiển thị trên PR
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: deploy
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: /opt/giapha/deploy/scripts/deploy.sh main    # pull tag 'main' → migrate → up -d
      - name: E2E smoke
        run: pnpm dlx playwright test e2e/smoke --config e2e/staging.config.ts
      - name: ZAP baseline
        uses: zaproxy/action-baseline@v0.12.0
        with: { target: https://staging.giapha.example }
```

```yaml
name: Deploy Production
on:
  push: { tags: ["v*"] }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production            # BẮT BUỘC reviewer approve trong GitHub Environments
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: deploy
          key: ${{ secrets.PROD_SSH_KEY }}
          script: /opt/giapha/deploy/scripts/deploy.sh ${{ github.ref_name }}
      - name: Healthcheck
        run: |
          for i in $(seq 1 30); do
            curl -fsS https://giapha.example/actuator/health && exit 0; sleep 10; done; exit 1
      - name: Notify Zalo/Telegram
        if: always()
        run: curl -s -X POST "$WEBHOOK" -d "text=Deploy ${{ github.ref_name }}: ${{ job.status }}"
        env: { WEBHOOK: ${{ secrets.OPS_WEBHOOK }} }
```

**`deploy.sh` trên server (cốt lõi):**
```bash
#!/usr/bin/env bash
set -euo pipefail
TAG="${1:?usage: deploy.sh <tag>}"
cd /opt/giapha
export IMAGE_TAG="$TAG"
docker compose -f compose/docker-compose.base.yml -f compose/docker-compose.prod.yml pull
docker compose ... run --rm api-migrate            # Liquibase migrate trước (job riêng, cùng image API)
docker compose ... up -d --wait                    # --wait: chờ healthcheck, fail thì exit ≠ 0
docker image prune -f
```
Rollback = `deploy.sh <tag-trước>` (image đổi được vì migration luôn backward-compatible 1 phiên bản — TK-09 §3).

## 5. Các bước thiết lập CI/CD (checklist làm 1 lần)

1. **Repo GitHub**: push monorepo; bật GHCR (Settings → Packages).
2. **Branch protection** `main`: require PR, 1 approval, status checks `backend`, `frontend`, `security` (+`playwright` nếu có nhãn ui), require branches up-to-date, cấm force-push.
3. **Environments**: tạo `staging` (không cần reviewer) và `production` (required reviewers = chủ dự án; wait timer 0–10'). Gắn secret theo environment: `STAGING_HOST/SSH_KEY`, `PROD_HOST/SSH_KEY`, `OPS_WEBHOOK`.
4. **Chuẩn bị VPS** (staging & prod, mỗi máy ~15'):
   ```bash
   adduser deploy && usermod -aG docker deploy      # user riêng, không sudo
   # cài docker + compose plugin; ufw allow 80,443,22; fail2ban
   mkdir -p /opt/giapha && chown deploy /opt/giapha
   # copy deploy/ (compose, scripts) + tạo .env từ .env.example (điền secret thật)
   # đăng nhập GHCR: docker login ghcr.io -u <bot> -p <PAT read:packages>
   ./scripts/deploy.sh v0.1.0                       # lần đầu: kéo toàn bộ + init
   # cron: 02:00 backup.sh | 03:00 renew TLS | @weekly trivy image scan
   ```
5. **Khóa SSH deploy**: tạo keypair riêng cho CI (`ssh-keygen -t ed25519`), public key vào `authorized_keys` của user `deploy` **giới hạn lệnh** (`command="/opt/giapha/deploy/scripts/deploy.sh ..."` trong authorized_keys nếu muốn chặt hơn).
6. **Bảo vệ tag**: Settings → Tags → protect `v*` (chỉ maintainer được tạo) — vì tag là nút bấm deploy production.
7. **Dependabot/Renovate** bật cho gradle + pnpm + docker; auto-PR vá CVE (đi qua đúng bộ gates).
8. **Nightly**: bật `nightly.yml` (drift audit token, dependency check, verify backup restore vào container tạm).

## 6. Tiêu chí nghiệm thu hạ tầng

- [ ] PR bất kỳ: 4 job gate chạy < 10 phút (cache ấm), đỏ là không merge được.
- [ ] Merge `main` → staging tự cập nhật < 5 phút, E2E smoke + ZAP xanh.
- [ ] Tạo tag `v1.0.0` → GitHub yêu cầu approve → production cập nhật không rớt request (compose `--wait` + nginx giữ kết nối).
- [ ] `rollback.sh` đưa hệ về tag trước < 3 phút.
- [ ] Restore backup vào staging thành công (diễn tập quý — TK-09 §4).
- [ ] Server không chứa secret trong git; CI không chứa secret ứng dụng.
