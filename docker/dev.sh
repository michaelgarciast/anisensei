#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

trap 'docker image prune -f >/dev/null' EXIT

docker build -f docker/Dockerfile --target dev -t anisensei:dev .
docker run --rm --init -it -p 3000:3000 \
  --env-file .env.local \
  -v "$PWD":/app \
  -v /app/node_modules \
  anisensei:dev
