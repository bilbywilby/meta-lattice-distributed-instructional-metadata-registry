#!/bin/bash
CANARY_URL="https://canary---sentinel-service-hash.a.run.app"
echo "[SMOKE] Verifying Canary Endpoint: $CANARY_URL"
# Check Health Endpoint
RESPONSE=$(curl -s --max-time 5 "$CANARY_URL/api/health")
if [[ $RESPONSE == *"META_LATTICE_V1.0_PROD"* ]]; then
  echo "[SMOKE] Health Check PASSED: System string verified."
else
  echo "[SMOKE] Health Check FAILED: System string mismatch or timeout."
  exit 1
fi
# Check Stats Integrity
STATS=$(curl -s --max-time 5 "$CANARY_URL/api/v1/stats")
if [[ $STATS == *"success\":true"* ]]; then
  echo "[SMOKE] Stats Retrieval PASSED."
else
  echo "[SMOKE] Stats Retrieval FAILED."
  exit 1
fi
echo "[SMOKE] Canary Deployment Healthy."
exit 0