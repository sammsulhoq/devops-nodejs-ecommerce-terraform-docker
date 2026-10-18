#!/usr/bin/env bash
set -Eeuo pipefail
cd "$(dirname "$0")/.."
terraform -chdir=terraform init
terraform -chdir=terraform fmt -check
terraform -chdir=terraform validate
terraform -chdir=terraform apply -input=false -auto-approve   -var="dockerhub_namespace=${DOCKERHUB_NAMESPACE:-sammsulhoquechoudhary}"   -var="image_tag=${IMAGE_TAG:-1.0.0}"
url="$(terraform -chdir=terraform output -raw frontend_url)"
for attempt in $(seq 1 90); do
  if curl --fail --silent --max-time 5 "$url/api/status" >/dev/null; then
    bash scripts/verify.sh "$url"
    printf '
Frontend URL: %s
' "$url"
    exit 0
  fi
  sleep 10
done
printf 'Application did not become ready: %s
' "$url" >&2
exit 1
