#!/usr/bin/env bash
# Provision GCP Firestore Point-in-Time Recovery (PITR) + Daily Managed Backups
# and GCS Encrypted Retention Bucket (Plan item 4.6, D9: RPO 24h / RTO 4h, 30d retention).
#
# Usage:
#   GCP_PROJECT_ID="catalystlab-prod" GCP_REGION="us-central1" bash ops/gcloud/setup-firestore-backups.sh

set -euo pipefail

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID to the target Firebase/GCP project ID}"
GCP_REGION="${GCP_REGION:-us-central1}"
FIRESTORE_DATABASE_ID="${FIRESTORE_DATABASE_ID:-(default)}"
BACKUP_BUCKET="gs://${GCP_PROJECT_ID}-firestore-backups"
RETENTION_SECONDS=$((30 * 24 * 3600)) # 30 days (D9)

echo "[backup-setup] Configuring 7-day PITR + daily 30-day retention backup schedule on project=${GCP_PROJECT_ID} db=${FIRESTORE_DATABASE_ID}..."

# 1. Create dedicated encrypted export bucket with 30-day lifecycle purge
if ! gcloud storage buckets describe "${BACKUP_BUCKET}" --project="${GCP_PROJECT_ID}" >/dev/null 2>&1; then
  gcloud storage buckets create "${BACKUP_BUCKET}" \
    --project="${GCP_PROJECT_ID}" \
    --location="${GCP_REGION}" \
    --uniform-bucket-level-access \
    --public-access-prevention
fi

cat > /tmp/firestore-backup-lifecycle.json <<EOF
{
  "rule": [
    {
      "action": { "type": "Delete" },
      "condition": { "age": 30 }
    }
  ]
}
EOF
gcloud storage buckets update "${BACKUP_BUCKET}" \
  --project="${GCP_PROJECT_ID}" \
  --lifecycle-file=/tmp/firestore-backup-lifecycle.json
rm -f /tmp/firestore-backup-lifecycle.json

# 2. Enable Firestore Point-in-Time Recovery (PITR)
gcloud firestore databases update \
  --project="${GCP_PROJECT_ID}" \
  --database="${FIRESTORE_DATABASE_ID}" \
  --enable-pitr

# 3. Ensure daily native backup schedule with 30-day retention (RPO <= 24h)
EXISTING_SCHEDULES="$(gcloud firestore backups schedules list --project="${GCP_PROJECT_ID}" --database="${FIRESTORE_DATABASE_ID}" --format="value(name)" || true)"
if [ -z "${EXISTING_SCHEDULES}" ]; then
  gcloud firestore backups schedules create \
    --project="${GCP_PROJECT_ID}" \
    --database="${FIRESTORE_DATABASE_ID}" \
    --recurrence=daily \
    --retention=30d
fi

echo "[backup-setup] Active schedules:"
gcloud firestore backups schedules list --project="${GCP_PROJECT_ID}" --database="${FIRESTORE_DATABASE_ID}"
