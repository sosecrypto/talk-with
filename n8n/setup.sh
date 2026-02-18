#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
N8N_URL="${N8N_URL:-http://localhost:5678}"
MAX_WAIT=60

echo "=== Talk With Legends - n8n Setup ==="

# 1. Start containers
echo "[1/3] Starting n8n container..."
cd "$SCRIPT_DIR"
docker compose up -d

# 2. Wait for n8n to be ready
echo "[2/3] Waiting for n8n to be ready (max ${MAX_WAIT}s)..."
elapsed=0
until curl -s -o /dev/null -w "%{http_code}" "$N8N_URL/healthz" 2>/dev/null | grep -q "200"; do
  if [ $elapsed -ge $MAX_WAIT ]; then
    echo "ERROR: n8n did not start within ${MAX_WAIT}s"
    echo "Check logs with: docker compose -f $SCRIPT_DIR/docker-compose.yml logs"
    exit 1
  fi
  sleep 2
  elapsed=$((elapsed + 2))
  echo "  Waiting... (${elapsed}s)"
done
echo "  n8n is ready!"

# 3. Import workflows
echo "[3/3] Importing workflows..."
WORKFLOW_DIR="$SCRIPT_DIR/workflows"
imported=0

for workflow_file in "$WORKFLOW_DIR"/*.json; do
  if [ -f "$workflow_file" ]; then
    filename=$(basename "$workflow_file")
    echo "  Importing: $filename"

    response=$(curl -s -w "\n%{http_code}" \
      -X POST "$N8N_URL/api/v1/workflows" \
      -H "Content-Type: application/json" \
      -u "admin:${N8N_PASSWORD:-changeme}" \
      -d @"$workflow_file" 2>/dev/null)

    http_code=$(echo "$response" | tail -1)

    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
      echo "    OK"
      imported=$((imported + 1))
    else
      echo "    WARN: HTTP $http_code (may already exist)"
    fi
  fi
done

echo ""
echo "=== Setup Complete ==="
echo "  n8n URL: $N8N_URL"
echo "  Workflows imported: $imported"
echo "  Login: admin / (your N8N_PASSWORD)"
echo "========================"
