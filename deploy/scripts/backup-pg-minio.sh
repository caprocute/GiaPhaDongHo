#!/usr/bin/env bash
# Sao lưu Postgres (pg_dump) + đồng bộ MinIO bucket sang thư mục/remote backup — TK-09 / R1.10.
set -euo pipefail

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_ROOT="${BACKUP_ROOT:-./backups}"
PG_CONTAINER="${PG_CONTAINER:-}"
DB_NAME="${DB_NAME:-giapha}"
DB_USER="${DB_USER:-giapha}"
MINIO_ALIAS="${MINIO_ALIAS:-local}"
MINIO_BUCKET="${MINIO_BUCKET:-giapha}"
MINIO_MIRROR_TARGET="${MINIO_MIRROR_TARGET:-}"

mkdir -p "$BACKUP_ROOT/postgres" "$BACKUP_ROOT/minio"

echo "==> Postgres dump → $BACKUP_ROOT/postgres/${DB_NAME}_${STAMP}.dump"
if [[ -n "$PG_CONTAINER" ]]; then
  docker exec -t "$PG_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc \
    > "$BACKUP_ROOT/postgres/${DB_NAME}_${STAMP}.dump"
elif command -v pg_dump >/dev/null 2>&1; then
  pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc \
    > "$BACKUP_ROOT/postgres/${DB_NAME}_${STAMP}.dump"
else
  echo "Cần PG_CONTAINER=... hoặc pg_dump trên PATH" >&2
  exit 1
fi

if command -v mc >/dev/null 2>&1; then
  DEST="${MINIO_MIRROR_TARGET:-$BACKUP_ROOT/minio/${MINIO_BUCKET}_${STAMP}}"
  echo "==> MinIO mirror ${MINIO_ALIAS}/${MINIO_BUCKET} → $DEST"
  mkdir -p "$DEST"
  mc mirror --overwrite "${MINIO_ALIAS}/${MINIO_BUCKET}" "$DEST"
else
  echo "Bỏ qua MinIO (chưa có mc). Cài MinIO Client để mirror bucket." >&2
fi

# Giữ 14 bản dump gần nhất
ls -1t "$BACKUP_ROOT/postgres"/*.dump 2>/dev/null | tail -n +15 | xargs -r rm -f || true

echo "Xong backup $STAMP"
