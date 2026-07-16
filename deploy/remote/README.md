# Hạ tầng DEV GiaPhaHub (remote)

Server dùng chung với stack `st-*` — compose này **tách riêng**, bind port riêng:

| Service | Container | Host port (server) |
|---------|-----------|--------------------|
| PostgreSQL 16 | `gph-postgres` | **15432** |
| Redis 7 | `gph-redis` | **16379** |
| MinIO | `gph-minio` | **19000** (API), **19001** (console) |
| Elasticsearch 8 | `gph-elasticsearch` | **19200** |
| Keycloak 26 | `gph-keycloak` | **18086** (HTTP), **18087** (management — tránh đụng MinIO :9000) |

Không dùng 5432 / 9000 / 9200 / 8081 (đã có dịch vụ khác).

> Server hiện lỗi iptables chain `DOCKER` → compose dùng **`network_mode: host`** + bind `./data/*`. Postgres cần `privileged: true` để initdb ghi được trên volume.

## Triển khai trên server

```bash
mkdir -p ~/giapha-infra/data/{pg,redis,minio,es} && cd ~/giapha-infra
# copy docker-compose.giapha-infra.yml + .env (từ .env.example)
chmod -R 777 data
docker compose -f docker-compose.giapha-infra.yml --env-file .env up -d
docker compose -f docker-compose.giapha-infra.yml ps
```

## Máy local

1. Điền `.env.tunnel.local` (từ `.env.tunnel.local.example`) — **không commit**.
2. Chạy `deploy/scripts/tunnel-infra.sh start` hoặc skill `/infra-tunnel`.
3. App trỏ `localhost:<port tunnel cố định>` (xem script / example).
4. OIDC FE: copy `frontend/apps/admin/.env.example` → `.env.local` và portal tương tự.
5. Đồng bộ realm IAM R1.5 lên Keycloak remote: `./deploy/scripts/sync-keycloak-realm.sh`.
