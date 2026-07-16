#!/usr/bin/env bash
# Đồng bộ realm jhipster (R1.5 IAM) lên Keycloak DEV remote.
# Yêu cầu: .env.tunnel.local; Keycloak đang chạy trên server (port 18086).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

ENV_FILE="${ENV_FILE:-$ROOT/.env.tunnel.local}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Thiếu $ENV_FILE — copy từ .env.tunnel.local.example" >&2
  exit 1
fi
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

SSH_HOST="${SSH_HOST:?}"
SSH_PORT="${SSH_PORT:-22}"
SSH_USER="${SSH_USER:?}"
REALM_SRC="$ROOT/backend/src/main/docker/realm-config/jhipster-realm.json"
REMOTE_DIR="${REMOTE_GPH_DIR:-giapha-infra}"

if [[ ! -f "$REALM_SRC" ]]; then
  echo "Không thấy $REALM_SRC" >&2
  exit 1
fi

ssh_cmd() {
  if [[ -n "${SSH_IDENTITY_FILE:-}" ]]; then
    ssh -i "$SSH_IDENTITY_FILE" -o IdentitiesOnly=yes -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$@"
  elif [[ -n "${SSH_PASSWORD:-}" ]] && command -v sshpass >/dev/null 2>&1; then
    sshpass -p "$SSH_PASSWORD" ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no \
      -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$@"
  else
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$@"
  fi
}

scp_cmd() {
  if [[ -n "${SSH_IDENTITY_FILE:-}" ]]; then
    scp -i "$SSH_IDENTITY_FILE" -o IdentitiesOnly=yes -P "$SSH_PORT" "$@"
  elif [[ -n "${SSH_PASSWORD:-}" ]] && command -v sshpass >/dev/null 2>&1; then
    sshpass -p "$SSH_PASSWORD" scp -o PreferredAuthentications=password -o PubkeyAuthentication=no \
      -P "$SSH_PORT" "$@"
  else
    scp -P "$SSH_PORT" "$@"
  fi
}

echo "==> Upload realm JSON → ~/${REMOTE_DIR}/realm-config/"
ssh_cmd "mkdir -p ~/${REMOTE_DIR}/realm-config"
scp_cmd "$REALM_SRC" "$SSH_USER@$SSH_HOST:~/${REMOTE_DIR}/realm-config/jhipster-realm.json"

echo "==> Import realm trên server (override) + restart Keycloak"
ssh_cmd bash -s <<'REMOTE'
set -euo pipefail
cd ~/giapha-infra

# Tránh lỗi source khi GPH_ES_JAVA_OPTS chưa được quote
if grep -qE '^GPH_ES_JAVA_OPTS=-Xms[^"]' .env 2>/dev/null; then
  sed -i 's/^GPH_ES_JAVA_OPTS=\(.*\)$/GPH_ES_JAVA_OPTS="\1"/' .env || true
fi

# shellcheck disable=SC1091
set -a; source .env; set +a

mkdir -p realm-config
test -f realm-config/jhipster-realm.json

echo "Stop gph-keycloak..."
docker compose -f docker-compose.giapha-infra.yml --env-file .env stop gph-keycloak || true

echo "Import realm (override)..."
docker run --rm --network host \
  -v "$HOME/giapha-infra/realm-config:/import:ro" \
  -e KC_DB=postgres \
  -e KC_DB_URL="jdbc:postgresql://127.0.0.1:15432/${GPH_DB_NAME:-giapha}" \
  -e KC_DB_USERNAME="${GPH_DB_USER:-giapha}" \
  -e KC_DB_PASSWORD="${GPH_DB_PASSWORD}" \
  quay.io/keycloak/keycloak:26.0 \
  import --file=/import/jhipster-realm.json --override=true

echo "Start gph-keycloak..."
docker compose -f docker-compose.giapha-infra.yml --env-file .env up -d gph-keycloak

echo "Chờ Keycloak healthy..."
for i in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:18086/realms/jhipster/.well-known/openid-configuration" >/dev/null; then
    echo "OK realm jhipster sẵn sàng (lần thử $i)"
    exit 0
  fi
  sleep 2
done
echo "WARN: timeout chờ OIDC discovery — kiểm tra: docker logs gph-keycloak" >&2
exit 1
REMOTE

echo "==> Xong. Local: ./deploy/scripts/tunnel-infra.sh start rồi mở http://localhost:18086"
echo "    Clients: giapha_admin / giapha_portal · Roles: ROLE_MEMBER|EDITOR|GENEALOGY_ADMIN"
