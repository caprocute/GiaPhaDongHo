#!/usr/bin/env bash
# Deploy tag (mặc định main) trên server staging/prod — TK-12 / R1.10.
set -euo pipefail

TAG="${1:-main}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
COMPOSE_DIR="$ROOT/deploy/compose"

export API_IMAGE="${API_IMAGE:-ghcr.io/${GITHUB_REPOSITORY:-caprocute/giaphadongho}/api:$TAG}"
export PORTAL_IMAGE="${PORTAL_IMAGE:-ghcr.io/${GITHUB_REPOSITORY:-caprocute/giaphadongho}/portal:$TAG}"
export ADMIN_IMAGE="${ADMIN_IMAGE:-ghcr.io/${GITHUB_REPOSITORY:-caprocute/giaphadongho}/admin:$TAG}"

cd "$COMPOSE_DIR"
echo "Deploy images: api=$API_IMAGE portal=$PORTAL_IMAGE admin=$ADMIN_IMAGE"
docker compose -f docker-compose.base.yml -f docker-compose.apps.yml pull
docker compose -f docker-compose.base.yml -f docker-compose.apps.yml up -d
docker compose -f docker-compose.base.yml -f docker-compose.apps.yml ps
echo "Deploy xong tag=$TAG"
