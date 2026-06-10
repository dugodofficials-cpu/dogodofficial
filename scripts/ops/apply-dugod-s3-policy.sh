#!/usr/bin/env bash
set -euo pipefail

# Automatically apply S3 policy to restrict access to dugodofficial-* buckets only
# Usage: scripts/ops/apply-dugod-s3-policy.sh [profile] [region]

PROFILE="${1:-Dugod}"
REGION="${2:-us-east-1}"
POLICY_NAME="DugodS3Only"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
POLICY_FILE="$ROOT_DIR/scripts/ops/policies/dugod-s3-only-policy.json"

# Run preflight first to ensure we're in the correct account
"$ROOT_DIR/scripts/ops/enforce-aws-account.sh" "788184849448" "$PROFILE" "$REGION"

echo "[POLICY] Getting IAM user from current credentials..."

# Get the IAM user name from the current credentials
CALLER_ARN="$(AWS_PAGER="" aws sts get-caller-identity --profile "$PROFILE" --query 'Arn' --output text)"

# Extract user name from ARN (format: arn:aws:iam::ACCOUNT:user/USERNAME)
if [[ "$CALLER_ARN" == *":user/"* ]]; then
  IAM_USER="$(echo "$CALLER_ARN" | sed 's/.*:user\///')"
  echo "[POLICY] Found IAM user: $IAM_USER"
else
  echo "[POLICY] ERROR: Current credentials are not an IAM user (might be a role): $CALLER_ARN" >&2
  echo "[POLICY] If using a role, you need to apply the policy manually in AWS Console." >&2
  exit 1
fi

# Check if policy file exists
if [[ ! -f "$POLICY_FILE" ]]; then
  echo "[POLICY] ERROR: Policy file not found: $POLICY_FILE" >&2
  exit 1
fi

echo "[POLICY] Applying S3-only policy to user '$IAM_USER'..."

# Apply the inline policy to the user
AWS_PAGER="" aws iam put-user-policy \
  --profile "$PROFILE" \
  --region "$REGION" \
  --user-name "$IAM_USER" \
  --policy-name "$POLICY_NAME" \
  --policy-document "file://$POLICY_FILE"

echo "[POLICY] ✅ Policy '$POLICY_NAME' applied to user '$IAM_USER'"
echo "[POLICY] S3 access is now restricted to dugodofficial-* buckets only"

# Verify the policy was applied
echo "[POLICY] Verifying policy..."
AWS_PAGER="" aws iam get-user-policy \
  --profile "$PROFILE" \
  --region "$REGION" \
  --user-name "$IAM_USER" \
  --policy-name "$POLICY_NAME" \
  --query 'PolicyName' \
  --output text >/dev/null

echo "[POLICY] ✅ Verified - policy is active"
echo ""
echo "[POLICY] IMPORTANT: Wait 10-30 seconds for IAM changes to propagate, then test with:"
echo "  scripts/ops/verify-s3-dugod-only.sh $PROFILE $REGION"
