#!/usr/bin/env bash
set -euo pipefail

# Preflight for any destructive/apply operation against DuGod account.
# Usage:
#   scripts/ops/dugod-preflight.sh [profile] [region]

PROFILE="${1:-Dugod}"
REGION="${2:-us-east-1}"
EXPECTED_ACCOUNT_ID="788184849448"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

"$ROOT_DIR/scripts/ops/enforce-aws-account.sh" "$EXPECTED_ACCOUNT_ID" "$PROFILE" "$REGION"

echo "[PREFLIGHT] Verifying caller identity"
AWS_PAGER="" aws sts get-caller-identity --profile "$PROFILE" --output table

echo "[PREFLIGHT] Verifying credentials are usable"
AWS_PAGER="" aws s3api list-buckets --profile "$PROFILE" --max-items 1 --output table >/dev/null

# Verify S3 access is limited to dugodofficial-* buckets only
echo "[PREFLIGHT] Verifying S3 bucket access is Dugod-only"
"$ROOT_DIR/scripts/ops/verify-s3-dugod-only.sh" "$PROFILE" "$REGION"

echo "[PREFLIGHT] SAFE TO PROCEED for profile '$PROFILE' in account '$EXPECTED_ACCOUNT_ID' region '$REGION'"
