---
name: infra-tunnel
description: >-
  Mở/đóng SSH tunnel tới hạ tầng DEV GiaPhaHub (Postgres, Redis, MinIO, ES,
  Keycloak) trên server remote. Dùng khi cần DB/Redis/MinIO/ES/Keycloak local,
  chạy tunnel-infra, hoặc cấu hình app trỏ localhost port cố định.
---

# Infra tunnel (GiaPhaHub DEV)

## Khi nào dùng

- Cần Postgres / Redis / MinIO / Elasticsearch / Keycloak cho dev local.
- User nói tunnel, mở hạ tầng, kết nối server DEV, `tunnel-infra`.

## Quy tắc

1. **Không commit** `.env.tunnel.local` hay mật khẩu SSH.
2. Hạ tầng chạy trên server qua `deploy/remote/docker-compose.giapha-infra.yml` (port riêng, không đụng `st-*`).
3. Local chỉ **tunnel** — không `docker compose` lại Postgres/Redis/MinIO/ES/KC trên laptop (trừ khi user yêu cầu offline).
4. Port local cố định (script tự **kill** tiến trình chiếm port trước khi bind):

| Service | localhost |
|---------|-----------|
| Postgres | 15432 |
| Redis | 16379 |
| MinIO API | 19000 |
| MinIO console | 19001 |
| Elasticsearch | 19200 |
| Keycloak | 18086 |

## Quy trình agent

1. Kiểm tra có `.env.tunnel.local` (nếu thiếu: hướng dẫn copy từ `.env.tunnel.local.example`, **không** hỏi lại password nếu file đã có).
2. Chạy:

```bash
chmod +x deploy/scripts/tunnel-infra.sh
./deploy/scripts/tunnel-infra.sh start
./deploy/scripts/tunnel-infra.sh status
```

3. Cấu hình app theo `.env.local.example` (URL `localhost:<port trên>`).
4. Secret cấu hình app: **Jasypt** `ENC(...)` + `JASYPT_ENCRYPTOR_PASSWORD` (CLAUDE.md) — không ghi plaintext vào YAML commit được.
5. Khi xong phiên dài / user yêu cầu: `./deploy/scripts/tunnel-infra.sh stop`.

## Triển khai / sửa stack trên server

```bash
# Từ máy local (cần sshpass hoặc key trong .env.tunnel.local)
# Đồng bộ file rồi SSH:
# scp -P $SSH_PORT deploy/remote/* user@host:~/giapha-infra/
# ssh ... 'cd ~/giapha-infra && docker compose -f docker-compose.giapha-infra.yml --env-file .env up -d'
```

Không đổi port host trên server nếu chưa cập nhật bảng port trong script + skill này.
