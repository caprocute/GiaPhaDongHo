#!/usr/bin/env bash
# ============================================================================
# Sinh lại các file SQL trong database/postgres/ từ Liquibase master.xml.
# ============================================================================
# File SQL là ARTIFACT sinh tự động — KHÔNG sửa tay. Khi schema đổi (JDL/changelog),
# chạy script này để regenerate:
#
#   database/scripts/regenerate-sql.sh
#
# Cơ chế: tạo 2 database rỗng tạm thời trên Postgres (mặc định qua tunnel DEV
# :15432), chạy `gradlew liquibaseUpdateSql` để serialize toàn bộ changelog ra
# SQL (không đụng DB thật), rồi xoá database tạm.
#
# Biến môi trường (đều có default):
#   PGHOST=localhost  PGPORT=15432  PGADMIN_USER=giapha  PGPASSWORD=<từ .env.local>
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND="$ROOT/backend"
OUT="$ROOT/database/postgres"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-15432}"
PGADMIN_USER="${PGADMIN_USER:-giapha}"
# Lấy mật khẩu từ .env.local nếu chưa set PGPASSWORD
if [[ -z "${PGPASSWORD:-}" && -f "$ROOT/.env.local" ]]; then
  PGPASSWORD="$(grep '^DB_PASSWORD=' "$ROOT/.env.local" | cut -d= -f2-)"
fi
export PGPASSWORD

psql_admin() { psql -h "$PGHOST" -p "$PGPORT" -U "$PGADMIN_USER" -d giapha "$@"; }

gen() {
  local db="$1" contexts="$2" outfile="$3"
  echo "→ Sinh $outfile (contexts=$contexts) qua DB tạm '$db'…"
  psql_admin -c "DROP DATABASE IF EXISTS $db;" >/dev/null
  psql_admin -c "CREATE DATABASE $db;" >/dev/null

  local init="/tmp/lb-regen-$db.gradle"
  cat > "$init" <<EOF
allprojects {
  afterEvaluate { p ->
    if (p.extensions.findByName('liquibase')) {
      def lb = p.extensions.getByName('liquibase')
      lb.activities.getByName('main') {
        url 'jdbc:postgresql://$PGHOST:$PGPORT/$db'
        username '$PGADMIN_USER'
        password '$PGPASSWORD'
        searchPath 'src/main/resources/'
        changelogFile 'config/liquibase/master.xml'
        logLevel 'warning'
        contexts '$contexts'
        outputFile '$outfile'
      }
    }
  }
}
EOF
  ( cd "$BACKEND" && ./gradlew -I "$init" liquibaseUpdateSql -PrunList=main --console=plain -q )
  psql_admin -c "DROP DATABASE IF EXISTS $db;" >/dev/null
  rm -f "$init"

  # Xoá thông tin máy sinh (hostname trong dòng lock)
  sed -i.bak "s/LOCKEDBY = '[^']*'/LOCKEDBY = 'init-script'/g" "$outfile" && rm -f "$outfile.bak"
}

gen giapha_regen_schema prod "$OUT/01_schema.sql"

# LƯU Ý: KHÔNG generate bản 'dev,faker' ra SQL trực tiếp — Liquibase loadData dùng
# prepared statements nên `updateSql` chỉ chèn dòng WARNING thay vì INSERT chạy được.
# Muốn data mẫu để test: dùng data thật ở database/seed/ hoặc để app chạy Liquibase
# với contexts=dev,faker (tự nạp CSV lúc runtime).

echo "✓ Đã sinh lại 01_schema.sql. Nhớ thêm lại header docs ở đầu file (xem git diff)."
