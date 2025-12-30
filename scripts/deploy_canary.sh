#!/bin/bash
set -e
echo "[DEPlOY] Starting Canary Lifecycle for LV Hub v0.8.2"
# 1. Deploy new revision to Cloud Run without traffic
gcloud run deploy sentinel-service \
  --image gcr.io/lv-hub-prod/sentinel:v0.8.2 \
  --no-traffic \
  --tag canary \
  --region us-east1
echo "[DEPLOY] Revision tagged 'canary' is live (0% traffic)"
# 2. Update Kubernetes Sidecar Registry
kubectl apply -f infra/k8s-sentinel.yaml
# 3. Initiate 10% Traffic Split
echo "[DEPLOY] Shifting 10% traffic to Canary..."
gcloud run services update-traffic sentinel-service \
  --to-tags canary=10 \
  --region us-east1
echo "[DEPLOY] Monitoring Canary health..."
./scripts/smoke_canary.sh
echo "[DEPLOY] Canary verified. Shifting 100% traffic..."
gcloud run services update-traffic sentinel-service \
  --to-revisions sentinel-service-canary=100 \
  --region us-east1
echo "[DEPLOY] Production Deployment v0.8.2 Complete."