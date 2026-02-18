#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Talk With Legends - n8n Teardown ==="
cd "$SCRIPT_DIR"
docker compose down
echo "n8n container stopped and removed."
