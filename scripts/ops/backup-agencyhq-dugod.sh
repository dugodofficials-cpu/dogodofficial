#!/usr/bin/env bash
set -euo pipefail

# Backup current AgencyHQ resources found in DuGod account before cleanup.
# Usage:
#   scripts/ops/backup-agencyhq-dugod.sh [profile] [region]

PROFILE="${1:-Dugod}"
REGION="${2:-us-east-1}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="$ROOT_DIR/scripts/ops/backups/agencyhq-$STAMP"

CLUSTER_NAME="agencyhq-cluster"
SERVICE_NAME="agencyhq-service"
TASKDEF_FAMILY="agencyhq-task"
ECR_REPO="agencyhq"
ALB_NAME="agencyhq-alb"

mkdir -p "$OUT_DIR"

"$ROOT_DIR/scripts/ops/dugod-preflight.sh" "$PROFILE" "$REGION"

echo "[BACKUP] Writing AWS snapshots to: $OUT_DIR"

AWS_PAGER="" aws sts get-caller-identity --profile "$PROFILE" --output json > "$OUT_DIR/sts-get-caller-identity.json"
AWS_PAGER="" aws ecs describe-clusters --profile "$PROFILE" --region "$REGION" --clusters "$CLUSTER_NAME" --output json > "$OUT_DIR/ecs-describe-clusters.json" || true
AWS_PAGER="" aws ecs describe-services --profile "$PROFILE" --region "$REGION" --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" --output json > "$OUT_DIR/ecs-describe-services.json" || true
AWS_PAGER="" aws ecs describe-task-definition --profile "$PROFILE" --region "$REGION" --task-definition "$TASKDEF_FAMILY" --output json > "$OUT_DIR/ecs-describe-task-definition-latest.json" || true
AWS_PAGER="" aws ecs list-task-definitions --profile "$PROFILE" --region "$REGION" --family-prefix "$TASKDEF_FAMILY" --sort DESC --output json > "$OUT_DIR/ecs-list-task-definitions.json" || true
AWS_PAGER="" aws ecr describe-repositories --profile "$PROFILE" --region "$REGION" --repository-names "$ECR_REPO" --output json > "$OUT_DIR/ecr-describe-repository.json" || true
AWS_PAGER="" aws ecr list-images --profile "$PROFILE" --region "$REGION" --repository-name "$ECR_REPO" --output json > "$OUT_DIR/ecr-list-images.json" || true
AWS_PAGER="" aws elbv2 describe-load-balancers --profile "$PROFILE" --region "$REGION" --names "$ALB_NAME" --output json > "$OUT_DIR/elbv2-describe-load-balancer.json" || true

ALB_ARN="$(AWS_PAGER="" aws elbv2 describe-load-balancers --profile "$PROFILE" --region "$REGION" --names "$ALB_NAME" --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null || true)"
if [[ -n "$ALB_ARN" && "$ALB_ARN" != "None" ]]; then
  AWS_PAGER="" aws elbv2 describe-listeners --profile "$PROFILE" --region "$REGION" --load-balancer-arn "$ALB_ARN" --output json > "$OUT_DIR/elbv2-describe-listeners.json" || true
  AWS_PAGER="" aws elbv2 describe-target-groups --profile "$PROFILE" --region "$REGION" --load-balancer-arn "$ALB_ARN" --output json > "$OUT_DIR/elbv2-describe-target-groups.json" || true

  TG_ARN="$(AWS_PAGER="" aws elbv2 describe-target-groups --profile "$PROFILE" --region "$REGION" --load-balancer-arn "$ALB_ARN" --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || true)"
  if [[ -n "$TG_ARN" && "$TG_ARN" != "None" ]]; then
    AWS_PAGER="" aws elbv2 describe-target-health --profile "$PROFILE" --region "$REGION" --target-group-arn "$TG_ARN" --output json > "$OUT_DIR/elbv2-describe-target-health.json" || true
  fi
fi

echo "[BACKUP] Completed. Files created:"
ls -1 "$OUT_DIR"
