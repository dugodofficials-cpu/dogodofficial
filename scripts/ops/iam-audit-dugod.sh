#!/usr/bin/env bash
set -euo pipefail

# Audits IAM surfaces for DuGod account so only intended principals can mutate infra.
# Usage:
#   scripts/ops/iam-audit-dugod.sh [profile] [region]

PROFILE="${1:-Dugod}"
REGION="${2:-us-east-1}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

"$ROOT_DIR/scripts/ops/dugod-preflight.sh" "$PROFILE" "$REGION"

echo
echo "== IAM Users =="
AWS_PAGER="" aws iam list-users --profile "$PROFILE" --query 'Users[].{User:UserName,Created:CreateDate}' --output table

echo
echo "== IAM Roles (top 100) =="
AWS_PAGER="" aws iam list-roles --profile "$PROFILE" --max-items 100 --query 'Roles[].{Role:RoleName,Created:CreateDate}' --output table

echo
echo "== Access keys status (users) =="
for u in $(AWS_PAGER="" aws iam list-users --profile "$PROFILE" --query 'Users[].UserName' --output text); do
  echo "User: $u"
  AWS_PAGER="" aws iam list-access-keys --profile "$PROFILE" --user-name "$u" --query 'AccessKeyMetadata[].{Id:AccessKeyId,Status:Status,Created:CreateDate}' --output table
done

echo
echo "== Account summary =="
AWS_PAGER="" aws iam get-account-summary --profile "$PROFILE" --output table

echo
echo "Audit complete."
