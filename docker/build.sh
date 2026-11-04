#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

docker build -f docker/Dockerfile --target runner -t anisensei:latest .
echo "Listo. Ejecuta: docker run --rm -p 3000:3000 --env-file .env.local anisensei:latest"
