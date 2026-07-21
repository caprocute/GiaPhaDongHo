#!/usr/bin/env bash
# ============================================================================
# Khởi tạo lại DATABASE 'giapha' từ đầu trên một Postgres đã có (cài TAY).
# ============================================================================
# ⚠ XOÁ SẠCH database giapha rồi tạo lại schema (+ tuỳ chọn seed data thật).
# Dùng cho: máy dev đã cài Postgres cục bộ, hoặc Postgres qua tunnel :15432.
#
#   database/scripts/reset-db.sh            # schema + seed họ Hoàng
#   database/scripts/reset-db.sh --no-seed  # chỉ schema
#
# Biến môi trường (có default):
#   PGHOST=localhost  PGPORT=15432  PGADMIN_USER=giapha  PGADMIN_DB=postgres
#   PGPASSWORD=<từ .env.local nếu không set>
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DB_DIR="$ROOT/database"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-15432}"
PGADMIN_USER="${PGADMIN_USER:-giapha}"
PGADMIN_DB="${PGADMIN_DB:-postgres}"   # DB để kết nối khi DROP/CREATE (không thể xoá DB đang connect)
SEED=1
[[ "${1:-}" == "--no-seed" ]] && SEED=0

if [[ -z "${PGPASSWORD:-}" && -f "$ROOT/.env.local" ]]; then
  PGPASSWORD="$(grep '^DB_PASSWORD=' "$ROOT/.env.local" | cut -d= -f2-)"
fi
export PGPASSWORD

# Nếu PGADMIN_DB=postgres không tồn tại (image chỉ có DB giapha), fallback về giapha
if ! psql -h "$PGHOST" -p "$PGPORT" -U "$PGADMIN_USER" -d "$PGADMIN_DB" -tAc "SELECT 1" >/dev/null 2>&1; then
  PGADMIN_DB=giapha
fi

echo "⚠  Sắp XOÁ và tạo lại database 'giapha' trên $PGHOST:$PGPORT — Ctrl-C trong 3s để huỷ…"
sleep 3

psql -h "$PGHOST" -p "$PGPORT" -U "$PGADMIN_USER" -d "$PGADMIN_DB" -v ON_ERROR_STOP=1 <<SQL
DROP DATABASE IF EXISTS giapha WITH (FORCE);
CREATE DATABASE giapha OWNER $PGADMIN_USER;
SQL

echo "→ Nạp schema (01_schema.sql)…"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGADMIN_USER" -d giapha -v ON_ERROR_STOP=1 -q -f "$DB_DIR/postgres/01_schema.sql"

if [[ "$SEED" == "1" ]]; then
  echo "→ Nạp seed data thật họ Hoàng (10_seed_ho_hoang.sql)…"
  psql -h "$PGHOST" -p "$PGPORT" -U "$PGADMIN_USER" -d giapha -v ON_ERROR_STOP=1 -q -f "$DB_DIR/seed/10_seed_ho_hoang.sql"
fi

echo "✓ Xong. Kiểm tra:  psql -h $PGHOST -p $PGPORT -U $PGADMIN_USER -d giapha -c '\\dt'"
