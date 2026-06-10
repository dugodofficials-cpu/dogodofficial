#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   scripts/ops/enforce-aws-account.sh <expected_account_id> [profile] [expected_region]

EXPECTED_ACCOUNT_ID="${1:-}"
PROFILE="${2:-${AWS_PROFILE:-default}}"
EXPECTED_REGION="${3:-}"

if [[ -z "$EXPECTED_ACCOUNT_ID" ]]; then
  echo "Usage: scripts/ops/enforce-aws-account.sh <expected_account_id> [profile] [expected_region]" >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "Missing required command: aws" >&2
  exit 1
fi

ACTUAL_ACCOUNT_ID="$(AWS_PAGER="" aws sts get-caller-identity --profile "$PROFILE" --query 'Account' --output text 2>/dev/null || true)"

if [[ -z "$ACTUAL_ACCOUNT_ID" || "$ACTUAL_ACCOUNT_ID" == "None" ]]; then
  echo "[AWS GUARD] Unable to resolve account for profile '$PROFILE'." >&2
  exit 1
fi

if [[ "$ACTUAL_ACCOUNT_ID" != "$EXPECTED_ACCOUNT_ID" ]]; then
  echo "[AWS GUARD] BLOCKED: profile '$PROFILE' -> account '$ACTUAL_ACCOUNT_ID'" >&2
  echo "[AWS GUARD] Expected account: '$EXPECTED_ACCOUNT_ID'" >&2
  exit 1
fi

if [[ -n "$EXPECTED_REGION" ]]; then
  ACTUAL_REGION="$(aws configure get region --profile "$PROFILE" 2>/dev/null || true)"
  if [[ "$ACTUAL_REGION" != "$EXPECTED_REGION" ]]; then
    echo "[AWS GUARD] BLOCKED: profile '$PROFILE' default region '$ACTUAL_REGION'" >&2
    echo "[AWS GUARD] Expected region: '$EXPECTED_REGION'" >&2
    exit 1
  fi
fi

echo "[AWS GUARD] OK profile='$PROFILE' account='$ACTUAL_ACCOUNT_ID'${EXPECTED_REGION:+ region='$EXPECTED_REGION'}"
