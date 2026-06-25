#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

mkdir -p "$BACKUP_DIR"

OUTPUT_FILE="$BACKUP_DIR/life_management-${TIMESTAMP}.sql.gz"

echo "==> Backing up Postgres to $OUTPUT_FILE"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-life}" -d "${POSTGRES_DB:-life_management}" \
  | gzip > "$OUTPUT_FILE"

echo "==> Backup complete ($(du -h "$OUTPUT_FILE" | cut -f1))"

# Optional: upload to Google Drive with rclone if configured
if command -v rclone >/dev/null 2>&1 && [[ -n "${RCLONE_REMOTE:-}" ]]; then
  echo "==> Uploading to $RCLONE_REMOTE..."
  rclone copy "$OUTPUT_FILE" "$RCLONE_REMOTE"
  echo "==> Upload complete"
fi
