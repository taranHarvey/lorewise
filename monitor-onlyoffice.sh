#!/bin/bash

echo "🔍 Monitoring OnlyOffice container logs..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
  echo "=== $(date) ==="
  docker logs onlyoffice-documentserver --tail 5
  echo ""
  sleep 2
done
