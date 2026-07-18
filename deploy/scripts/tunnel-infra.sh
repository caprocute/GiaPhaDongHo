#!/usr/bin/env bash
# SSH tunnel hạ tầng DEV GiaPhaHub → server remote.
# Port local cố định; nếu bị chiếm thì kill tiến trình đang giữ port rồi mở lại.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="${TUNNEL_ENV_FILE:-$ROOT/.env.tunnel.local}"
PID_FILE="${TUNNEL_PID_FILE:-$ROOT/.tunnel-infra.pid}"

# Port tunnel cố định (local) — khớp host port trên server giapha-infra
LOCAL_PG=15432
LOCAL_REDIS=16379
LOCAL_MINIO=19000
LOCAL_MINIO_CONSOLE=19001
LOCAL_ES=19200
LOCAL_KC=18086
LOCAL_IMGPROXY=18888

usage() {
  cat <<EOF
Usage: $(basename "$0") {start|stop|status|ports}

Đọc SSH từ: $ENV_FILE
  SSH_HOST, SSH_PORT, SSH_USER, SSH_PASSWORD (hoặc SSH_IDENTITY_FILE)
EOF
}

load_env() {
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "Thiếu $ENV_FILE — copy từ .env.tunnel.local.example" >&2
    exit 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  : "${SSH_HOST:?}"
  : "${SSH_PORT:?}"
  : "${SSH_USER:?}"
}

# Kill tiến trình đang LISTEN trên port (macOS/Linux)
free_port() {
  local port="$1"
  local pids=""
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)"
  elif command -v fuser >/dev/null 2>&1; then
    pids="$(fuser "${port}/tcp" 2>/dev/null || true)"
  fi
  if [[ -n "${pids// /}" ]]; then
    echo "Port $port đang bị chiếm bởi PID: $pids — kill..."
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
    sleep 0.3
  fi
}

free_all_tunnel_ports() {
  for p in "$LOCAL_PG" "$LOCAL_REDIS" "$LOCAL_MINIO" "$LOCAL_MINIO_CONSOLE" "$LOCAL_ES" "$LOCAL_KC" "$LOCAL_IMGPROXY"; do
    free_port "$p"
  done
}

ssh_base() {
  local opts=(-o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes -p "$SSH_PORT")
  if [[ -n "${SSH_IDENTITY_FILE:-}" ]]; then
    opts+=(-i "$SSH_IDENTITY_FILE" -o IdentitiesOnly=yes)
    ssh "${opts[@]}" "$@"
  elif [[ -n "${SSH_PASSWORD:-}" ]] && command -v sshpass >/dev/null 2>&1; then
    sshpass -p "$SSH_PASSWORD" ssh "${opts[@]}" -o PreferredAuthentications=password -o PubkeyAuthentication=no "$@"
  else
    echo "Cần SSH_IDENTITY_FILE hoặc SSH_PASSWORD (+ sshpass)" >&2
    exit 1
  fi
}

start_tunnel() {
  load_env
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Tunnel đã chạy (PID $(cat "$PID_FILE")). Dùng: $0 status"
    exit 0
  fi
  free_all_tunnel_ports

  local forwards=(
    -L "${LOCAL_PG}:127.0.0.1:${REMOTE_PG_PORT:-15432}"
    -L "${LOCAL_REDIS}:127.0.0.1:${REMOTE_REDIS_PORT:-16379}"
    -L "${LOCAL_MINIO}:127.0.0.1:${REMOTE_MINIO_PORT:-19000}"
    -L "${LOCAL_MINIO_CONSOLE}:127.0.0.1:${REMOTE_MINIO_CONSOLE_PORT:-19001}"
    -L "${LOCAL_ES}:127.0.0.1:${REMOTE_ES_PORT:-19200}"
    -L "${LOCAL_KC}:127.0.0.1:${REMOTE_KC_PORT:-18086}"
    -L "${LOCAL_IMGPROXY}:127.0.0.1:${REMOTE_IMGPROXY_PORT:-18888}"
  )

  # Nền: ssh -N
  if [[ -n "${SSH_IDENTITY_FILE:-}" ]]; then
    ssh -f -N \
      -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes \
      -o IdentitiesOnly=yes -i "$SSH_IDENTITY_FILE" \
      -p "$SSH_PORT" \
      "${forwards[@]}" \
      "${SSH_USER}@${SSH_HOST}"
  else
    sshpass -p "$SSH_PASSWORD" ssh -f -N \
      -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes \
      -o PreferredAuthentications=password -o PubkeyAuthentication=no \
      -p "$SSH_PORT" \
      "${forwards[@]}" \
      "${SSH_USER}@${SSH_HOST}"
  fi

  sleep 0.8
  local pid=""
  # macOS/Linux: tiến trình ssh đang giữ LOCAL_PG
  if command -v lsof >/dev/null 2>&1; then
    pid="$(lsof -nP -iTCP:"$LOCAL_PG" -sTCP:LISTEN -t 2>/dev/null | head -1 || true)"
  fi
  if [[ -z "$pid" ]]; then
    pid="$(pgrep -n -f "ssh.*( -L |${SSH_HOST})" 2>/dev/null || true)"
  fi
  if [[ -z "$pid" ]]; then
    echo "Tunnel có thể đã mở nhưng không lấy được PID — chạy: $0 status" >&2
  else
    echo "$pid" >"$PID_FILE"
    echo "Tunnel OK PID=$pid"
  fi
  print_ports
}

stop_tunnel() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE")"
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
      echo "Đã dừng tunnel PID=$pid"
    fi
    rm -f "$PID_FILE"
  fi
  free_all_tunnel_ports
}

status_tunnel() {
  echo "=== Port tunnel (local) ==="
  print_ports
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "Trạng thái: RUNNING PID=$(cat "$PID_FILE")"
  else
    echo "Trạng thái: STOPPED"
  fi
  for p in "$LOCAL_PG" "$LOCAL_REDIS" "$LOCAL_MINIO" "$LOCAL_ES" "$LOCAL_KC" "$LOCAL_IMGPROXY"; do
    if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "LISTEN :$p — $(lsof -nP -iTCP:"$p" -sTCP:LISTEN | tail -n +2 | awk '{print $1,$2}' | head -1)"
    else
      echo "FREE   :$p"
    fi
  done
}

print_ports() {
  cat <<EOF
  Postgres        localhost:${LOCAL_PG}
  Redis           localhost:${LOCAL_REDIS}
  MinIO API       localhost:${LOCAL_MINIO}
  MinIO console   localhost:${LOCAL_MINIO_CONSOLE}
  Elasticsearch   localhost:${LOCAL_ES}
  Keycloak        localhost:${LOCAL_KC}
  imgproxy        localhost:${LOCAL_IMGPROXY}
EOF
}

cmd="${1:-}"
case "$cmd" in
  start) start_tunnel ;;
  stop) stop_tunnel ;;
  status) status_tunnel ;;
  ports) print_ports ;;
  *) usage; exit 1 ;;
esac
