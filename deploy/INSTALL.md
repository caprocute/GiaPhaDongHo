# GiaPhaHub — Cài đặt toàn bộ kiến trúc hệ thống

Hướng dẫn dựng **toàn bộ** GiaPhaHub (hạ tầng + ứng dụng) theo 2 phương án:
**Docker Compose** và **Kubernetes**. Muốn dựng **riêng database**, xem
[`database/README.md`](../database/README.md).

---

## Kiến trúc

```
                    ┌─────────── Ingress / reverse proxy ───────────┐
                    │                    │                          │
              ┌─────▼─────┐        ┌─────▼─────┐              ┌──────▼──────┐
              │  portal   │        │   admin   │              │     api     │
              │ Next.js   │        │ Vite+nginx│              │ Spring Boot │
              │  :3000    │        │   :80     │              │   :8080     │
              └───────────┘        └───────────┘              └──────┬──────┘
                (khách xem)         (quản trị)                        │
                                                    ┌─────────────────┼───────────────┬───────────┐
                                                    ▼                 ▼               ▼           ▼
                                              ┌──────────┐     ┌──────────┐    ┌──────────┐ ┌──────────┐
                                              │ Postgres │     │  MinIO   │    │Elastic-  │ │  Redis   │
                                              │  :5432   │     │:9000/9001│    │search    │ │  :6379   │
                                              │          │     │          │    │  :9200   │ │          │
                                              └────┬─────┘     └────┬─────┘    └──────────┘ └──────────┘
                                                   │                │
                                              ┌────▼─────┐     ┌─────▼─────┐
                                              │ Keycloak │     │ imgproxy  │
                                              │  :8081   │     │  :8080    │
                                              │ (OIDC)   │     │(resize S3)│
                                              └──────────┘     └───────────┘
```

| Thành phần | Vai trò | Bền vững (volume) |
|-----------|---------|:---:|
| **postgres** | DB chính (app + Keycloak) | ✅ |
| **redis** | cache / rate-limit | ❌ |
| **minio** | lưu ảnh, tài liệu (S3) | ✅ |
| **elasticsearch** | full-text search (tuỳ chọn — trống thì fallback PG FTS) | ✅ |
| **keycloak** | OIDC đăng nhập | (DB trong postgres) |
| **imgproxy** | resize/optimize ảnh từ MinIO (tuỳ chọn) | ❌ |
| **api** | backend Spring Boot / JHipster, chạy Liquibase migration | ❌ |
| **portal** | web công khai (Next.js) | ❌ |
| **admin** | trang quản trị (Vite SPA) | ❌ |

---

## Phương án A — Docker Compose

Compose có sẵn trong `deploy/compose/`:

| File | Nội dung |
|------|----------|
| `docker-compose.base.yml` | postgres, redis, minio, keycloak (hạ tầng) |
| `docker-compose.apps.yml`  | api, portal, admin (ứng dụng, build hoặc pull GHCR) |
| `docker-compose.dev.yml`   | override mở port ra host cho DEV |
| `.env.example`             | biến môi trường mẫu |

> **Elasticsearch/imgproxy** không có trong `base` (app fallback PG FTS khi `ES_URL` trống).
> Cần đủ ES/imgproxy → dùng stack `deploy/remote/docker-compose.giapha-infra.yml`.

### A1. Chỉ hạ tầng (chạy app bằng gradle/pnpm ở host)

```bash
cd deploy/compose
cp .env.example .env          # đổi mật khẩu trong .env
docker compose -f docker-compose.base.yml -f docker-compose.dev.yml --profile dev up -d
docker compose -f docker-compose.base.yml -f docker-compose.dev.yml ps
```
Port ra host (dev): Postgres 5432 · Redis 6379 · MinIO 9000/9001 · Keycloak 8081.
Sau đó chạy backend `cd backend && ./gradlew bootRun` và FE riêng.

### A2. Toàn bộ hệ thống (hạ tầng + ứng dụng)

```bash
cd deploy/compose
cp .env.example .env          # đổi mật khẩu + URL public + JASYPT_ENCRYPTOR_PASSWORD

# Build image local (bỏ *_IMAGE trong .env) rồi lên:
docker compose -f docker-compose.base.yml -f docker-compose.apps.yml build
docker compose -f docker-compose.base.yml -f docker-compose.apps.yml up -d

# Hoặc pull image có sẵn từ GHCR (đặt API_IMAGE/PORTAL_IMAGE/ADMIN_IMAGE trong .env):
#   deploy/scripts/deploy.sh main
```
Truy cập: Portal http://localhost:3000 · Admin http://localhost:5173 · API http://localhost:8080/management/health · Keycloak http://localhost:8081.

> **FE nhúng URL lúc build:** `portal` (`NEXT_PUBLIC_*`) và `admin` (`VITE_*`) đọc build-arg
> lúc `build`. Đổi domain thật ⇒ set `APP_API_PUBLIC_URL` / `KC_PUBLIC_ISSUER_URI` trong
> `.env` **rồi build lại image**, không đổi được lúc chạy.

### A3. Nạp schema/seed database

App tự chạy Liquibase lúc khởi động ⇒ schema tạo tự động, **không cần** nạp SQL tay.
Muốn data thật họ Hoàng: sau khi API "healthy", chạy
`deploy/scripts/seed-dev.sh` hoặc nạp `database/seed/10_seed_ho_hoang.sql`
(xem [`database/README.md`](../database/README.md)).

### A4. Gỡ / reset
```bash
docker compose -f docker-compose.base.yml -f docker-compose.apps.yml down       # dừng, giữ data
docker compose -f docker-compose.base.yml -f docker-compose.apps.yml down -v     # XOÁ cả volume (reset sạch)
```

---

## Phương án B — Kubernetes

Manifest thô (raw, `kubectl apply` — không cần Helm) trong `deploy/k8s/`, đánh số theo
thứ tự áp dụng:

| File | Tài nguyên |
|------|-----------|
| `00-namespace.yaml` | Namespace `giapha` |
| `01-config.yaml` | ConfigMap + Secret (⚠ placeholder — đổi trước prod) |
| `10-postgres.yaml` | StatefulSet + Service + PVC 5Gi |
| `11-redis.yaml` | Deployment + Service |
| `12-minio.yaml` | Deployment + Service + PVC 10Gi |
| `13-elasticsearch.yaml` | StatefulSet + Service (tuỳ chọn) |
| `14-keycloak.yaml` | Deployment + Service |
| `15-imgproxy.yaml` | Deployment + Service (tuỳ chọn) |
| `20-api.yaml` | Deployment + Service (initContainer chờ Postgres) |
| `21-portal.yaml` / `22-admin.yaml` | Deployment + Service |
| `30-ingress.yaml` | Ingress (cần ingress-nginx; đổi host) |

Yêu cầu: một cluster K8s (minikube/kind/k3s hoặc cloud), `kubectl` đã trỏ context,
một `StorageClass` mặc định (cho PVC), và **ingress-nginx** nếu dùng Ingress.

### B1. Đổi secret (bắt buộc)

`01-config.yaml` chứa mật khẩu **placeholder**. Trước khi apply, sửa `stringData` trong
`01-config.yaml`, **hoặc** tạo Secret ngoài repo (khuyến nghị):
```bash
kubectl create namespace giapha
kubectl -n giapha create secret generic giapha-secret \
  --from-literal=DB_PASSWORD='...' \
  --from-literal=SPRING_DATASOURCE_PASSWORD='...' \
  --from-literal=MINIO_ACCESS_KEY='giapha' \
  --from-literal=MINIO_SECRET_KEY='...' \
  --from-literal=KC_ADMIN='admin' \
  --from-literal=KC_ADMIN_PASSWORD='...' \
  --from-literal=KEYCLOAK_ADMIN='admin' \
  --from-literal=KEYCLOAK_ADMIN_PASSWORD='...' \
  --from-literal=JASYPT_ENCRYPTOR_PASSWORD='...'
# rồi xoá phần Secret trong 01-config.yaml để không đè lên.
```
> Prod nên dùng SealedSecrets / External Secrets Operator + Jasypt `ENC(...)` theo luật dự án.

### B2. (Tuỳ chọn) ConfigMap init schema cho Postgres

Postgres StatefulSet mount ConfigMap `giapha-db-init` vào initdb (chạy khi PVC rỗng).
Tạo từ file SQL sẵn có:
```bash
kubectl -n giapha create configmap giapha-db-init \
  --from-file=01_schema.sql=../../database/postgres/01_schema.sql \
  --from-file=10_seed_ho_hoang.sql=../../database/seed/10_seed_ho_hoang.sql
```
> Bỏ qua bước này cũng được: API sẽ tự chạy Liquibase tạo schema khi khởi động (DB rỗng).
> ConfigMap init chỉ để có sẵn schema/seed ngay khi Postgres lên.

### B3. (Tuỳ chọn) ConfigMap realm Keycloak
```bash
kubectl -n giapha create configmap giapha-kc-realm \
  --from-file=../../backend/src/main/docker/realm-config/
```

### B4. Build & push image (nếu không dùng GHCR)

Manifest `20/21/22` trỏ `ghcr.io/caprocute/giaphadongho/*:main`. Tự build:
```bash
# API
docker build -f backend/Dockerfile -t <registry>/giapha-api:dev backend && docker push <registry>/giapha-api:dev
# Portal (URL public nhúng lúc build!)
docker build -f frontend/apps/portal/Dockerfile \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.giapha.example.com \
  -t <registry>/giapha-portal:dev . && docker push <registry>/giapha-portal:dev
# Admin
docker build -f frontend/apps/admin/Dockerfile \
  --build-arg VITE_API_BASE_URL=https://api.giapha.example.com \
  --build-arg VITE_OIDC_AUTHORITY=https://api.giapha.example.com/realms/jhipster \
  -t <registry>/giapha-admin:dev . && docker push <registry>/giapha-admin:dev
```
Sau đó sửa `image:` trong `20/21/22-*.yaml` cho khớp (hoặc `kubectl set image`).

### B5. Áp dụng

```bash
cd deploy/k8s
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-config.yaml        # bỏ nếu đã tạo Secret/ConfigMap tay ở B1
kubectl apply -f .                     # phần còn lại (idempotent, apply cả thư mục)

# Theo dõi tới khi Ready:
kubectl -n giapha get pods -w
kubectl -n giapha rollout status statefulset/postgres
kubectl -n giapha rollout status deploy/api
```
Thứ tự phụ thuộc được xử lý bằng probe + initContainer `wait-postgres` của API, nên
`kubectl apply -f .` một lần là đủ; pod chưa có dependency sẽ retry tới khi xanh.

### B6. Kiểm tra nhanh (không cần Ingress)
```bash
kubectl -n giapha exec deploy/api -- wget -qO- http://127.0.0.1:8080/management/health
kubectl -n giapha port-forward svc/portal 3000:3000    # → http://localhost:3000
kubectl -n giapha port-forward svc/admin 5173:80       # → http://localhost:5173
kubectl -n giapha port-forward svc/keycloak 8081:8081  # → http://localhost:8081
```

### B7. Ingress (public)

Sửa `30-ingress.yaml`: đổi `*.example.com` thành domain thật, bật khối `tls:` +
cấp cert (cert-manager). Apply lại `kubectl apply -f 30-ingress.yaml`.

### B8. Gỡ
```bash
kubectl delete namespace giapha        # xoá sạch (gồm cả PVC/dữ liệu)
```

---

## Kiểm chứng đã thực hiện

- `database/postgres/01_schema.sql` + `database/seed/10_seed_ho_hoang.sql`: đã chạy sạch
  trên PostgreSQL 16 (26 bảng, 126 người) — xem `database/README.md`.
- Manifest `deploy/k8s/*.yaml`: 12 file, YAML hợp lệ (9 Service, 7 Deployment, 2 StatefulSet,
  ConfigMap, Secret, PVC, Namespace, Ingress). Chưa `apply` lên cluster thật (môi trường này
  không có cluster) — hãy chạy `kubectl apply --dry-run=server` trên cluster của bạn trước khi lên prod.

## Lưu ý bảo mật

- Mọi mật khẩu trong file mẫu là **placeholder** — đổi hết trước khi dùng thật, không commit
  mật khẩu thật. Cấu hình nhạy cảm dùng Jasypt `ENC(...)` + `JASYPT_ENCRYPTOR_PASSWORD` qua
  Secret/env (theo luật dự án trong `CLAUDE.md`).
- Người còn sống trong dữ liệu = PII (NĐ 13/2023) — không đẩy seed thật lên môi trường công
  khai không kiểm soát.
- K8s prod: bật NetworkPolicy, resource limits đầy đủ, TLS ở Ingress, và không dùng
  `xpack.security.enabled=false` cho Elasticsearch.
