#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="docker-compose.prod.yml"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy .env.production.example and fill in values."
  exit 1
fi

echo "==> Pulling latest code..."
git pull --ff-only

echo "==> Building and starting production stack..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

echo "==> Running database seed (idempotent)..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T api npm run db:seed -w @life/db || true

echo "==> Done. Check: docker compose -f $COMPOSE_FILE --env-file $ENV_FILE ps"
