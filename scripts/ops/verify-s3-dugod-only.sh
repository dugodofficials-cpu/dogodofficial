#!/usr/bin/env bash
set -euo pipefail

# Verify S3 access is limited to dugodofficial-* buckets only
# Usage: scripts/ops/verify-s3-dugod-only.sh [profile] [region]

PROFILE="${1:-Dugod}"
REGION="${2:-us-east-1}"
ALLOWED_BUCKET_PREFIX="dugodofficial"

echo "[S3 GUARD] Checking S3 bucket access for profile '$PROFILE'..."

# Get all buckets
BUCKETS_JSON="$(AWS_PAGER="" aws s3api list-buckets --profile "$PROFILE" --region "$REGION" --query 'Buckets[*].Name' --output json 2>/dev/null || echo '[]')"

# Parse buckets and check for non-dugod buckets
VIOLATIONS=()
while IFS= read -r bucket; do
  bucket="$(echo "$bucket" | tr -d '"')"
  [[ -z "$bucket" ]] && continue
  if [[ ! "$bucket" == "${ALLOWED_BUCKET_PREFIX}"* ]]; then
    VIOLATIONS+=("$bucket")
  fi
done < <(echo "$BUCKETS_JSON" | tr ',' '\n' | tr -d '[]')

if [[ ${#VIOLATIONS[@]} -gt 0 ]]; then
  echo "[S3 GUARD] ⚠️  WARNING: Credentials can access non-Dugod buckets:" >&2
  for b in "${VIOLATIONS[@]}"; do
    echo "  - $b" >&2
  done
  echo "" >&2
  echo "[S3 GUARD] These buckets should NOT be accessible from Dugod credentials." >&2
  echo "[S3 GUARD] Please update IAM policy to restrict access to only '${ALLOWED_BUCKET_PREFIX}-*' buckets." >&2
  echo "" >&2
  echo "[S3 GUARD] Recommended IAM policy statement:" >&2
  cat << 'POLICY' >&2
{
  "Effect": "Allow",
  "Action": ["s3:*"],
  "Resource": [
    "arn:aws:s3:::dugodofficial-*",
    "arn:aws:s3:::dugodofficial-*/*"
  ]
}
POLICY
  echo "" >&2
  echo "[S3 GUARD] Run 'scripts/ops/apply-dugod-s3-policy.sh' to fix this, or update manually in AWS IAM console." >&2
  
  # Exit with error to block deployment
  exit 1
fi

echo "[S3 GUARD] ✅ OK - Only '${ALLOWED_BUCKET_PREFIX}-*' buckets are accessible"
exit 0
