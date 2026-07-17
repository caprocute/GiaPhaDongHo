#!/usr/bin/env bash
# Nạp seed DEV: SQL + ảnh MinIO thật.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="${ROOT}/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Thiếu $ENV_FILE — copy từ .env.local.example"
  exit 1
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

echo "==> SQL seed → localhost:15432/giapha"
PGPASSWORD="${DB_PASSWORD}" psql -h 127.0.0.1 -p 15432 -U "${DB_USER}" -d giapha \
  -v ON_ERROR_STOP=1 -f "${ROOT}/deploy/scripts/seed-dev-data.sql"

echo "==> Upload media thật lên MinIO"
python3 "${ROOT}/deploy/scripts/seed-media-minio.py"

echo "Xong. Portal tin tức đọc /api/v1/posts; album đọc /api/v1/media/gallery/photos."
