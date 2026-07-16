#!/usr/bin/env bash
# Nạp dữ liệu mẫu (khung) — mở rộng khi có API Person.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
echo "seed-dev: chờ API + Liquibase từ JHipster (backend/). Tree mẫu sẽ thêm sau R1.1."
echo "compose: cd $ROOT/deploy/compose && docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up -d"
