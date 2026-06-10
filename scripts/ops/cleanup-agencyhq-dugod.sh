#!/usr/bin/env bash
set -euo pipefail

# Destructive cleanup of AgencyHQ resources in DuGod account.
# Requires explicit confirmation token to run.
# Usage:
#   scripts/ops/cleanup-agencyhq-dugod.sh [profile] [region] --confirm DELETE_AGENCYHQ

PROFILE="${1:-Dugod}"
REGION="${2:-us-east-1}"
CONFIRM="${3:-}"
TOKEN="${4:-}"

if [[ "$CONFIRM" != "--confirm" || "$TOKEN" != "DELETE_AGENCYHQ" ]]; then
  echo "Refusing to run. Use: scripts/ops/cleanup-agencyhq-dugod.sh [profile] [region] --confirm DELETE_AGENCYHQ" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
"$ROOT_DIR/scripts/ops/dugod-preflight.sh" "$PROFILE" "$REGION"

CLUSTER_NAME="agencyhq-cluster"
SERVICE_NAME="agencyhq-service"
ALB_NAME="agencyhq-alb"
ECR_REPO="agencyhq"

echo "[CLEANUP] Scale down + delete ECS service"
AWS_PAGER="" aws ecs update-service --profile "$PROFILE" --region "$REGION" --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --desired-count 0 >/dev/null || true
AWS_PAGER="" aws ecs delete-service --profile "$PROFILE" --region "$REGION" --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --force >/dev/null || true

echo "[CLEANUP] Delete ALB listeners/target groups/load balancer"
ALB_ARN="$(AWS_PAGER="" aws elbv2 describe-load-balancers --profile "$PROFILE" --region "$REGION" --names "$ALB_NAME" --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null || true)"
if [[ -n "$ALB_ARN" && "$ALB_ARN" != "None" ]]; then
  LISTENERS="$(AWS_PAGER="" aws elbv2 describe-listeners --profile "$PROFILE" --region "$REGION" --load-balancer-arn "$ALB_ARN" --query 'Listeners[].ListenerArn' --output text 2>/dev/null || true)"
  for l in $LISTENERS; do
    AWS_PAGER="" aws elbv2 delete-listener --profile "$PROFILE" --region "$REGION" --listener-arn "$l" >/dev/null || true
  done

  TGS="$(AWS_PAGER="" aws elbv2 describe-target-groups --profile "$PROFILE" --region "$REGION" --load-balancer-arn "$ALB_ARN" --query 'TargetGroups[].TargetGroupArn' --output text 2>/dev/null || true)"

  AWS_PAGER="" aws elbv2 delete-load-balancer --profile "$PROFILE" --region "$REGION" --load-balancer-arn "$ALB_ARN" >/dev/null || true

  # Allow ELB to settle
  sleep 8
  for tg in $TGS; do
    AWS_PAGER="" aws elbv2 delete-target-group --profile "$PROFILE" --region "$REGION" --target-group-arn "$tg" >/dev/null || true
  done
fi

echo "[CLEANUP] Delete agencyhq ECR repository"
AWS_PAGER="" aws ecr delete-repository --profile "$PROFILE" --region "$REGION" --repository-name "$ECR_REPO" --force >/dev/null || true

echo "[CLEANUP] Delete agencyhq ECS cluster"
AWS_PAGER="" aws ecs delete-cluster --profile "$PROFILE" --region "$REGION" --cluster "$CLUSTER_NAME" >/dev/null || true

echo "[CLEANUP] Completed (best-effort)."
