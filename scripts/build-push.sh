#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
namespace="${DOCKERHUB_NAMESPACE:-sammsulhoquechoudhary}"
tag="${IMAGE_TAG:-1.0.0}"
command -v docker >/dev/null
node --test tests/services.test.js
for service in user products orders cart frontend; do
  docker build --platform linux/amd64 -t "$namespace/herovired-ecommerce-$service:$tag" "services/$service"
done
docker compose up -d --no-build --wait --wait-timeout 120
trap 'docker compose down' EXIT
bash scripts/verify.sh http://127.0.0.1
for service in user products orders cart frontend; do
  docker push "$namespace/herovired-ecommerce-$service:$tag"
done
printf 'All five images built, tested and pushed.
'
