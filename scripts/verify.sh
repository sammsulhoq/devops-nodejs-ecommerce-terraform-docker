#!/usr/bin/env bash
set -Eeuo pipefail
url="${1:-http://127.0.0.1}"
curl --fail --silent --show-error --max-time 10 "$url/" | python3 -c 'import sys; assert "Frontend is Live" in sys.stdin.read()'
for service in user products orders cart; do
  curl --fail --silent --show-error --max-time 10 "$url/api/$service" | python3 -c 'import json,sys; data=json.load(sys.stdin); assert data["service"]==sys.argv[1]; assert data["data"]; print(data["message"])' "$service"
done
curl --fail --silent --show-error --max-time 10 "$url/api/status" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert len(d["backends"])==4; assert all(s["status"]=="ok" for s in d["backends"]); print("All four backends healthy; frontend is live.")'
