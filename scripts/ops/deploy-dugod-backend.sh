#!/usr/bin/env bash
set -euo pipefail

# Deploy DuGod backend to ECS Fargate in DuGod account (safe/scripted)
# Usage:
#   scripts/ops/deploy-dugod-backend.sh [profile] [region]

PROFILE="${1:-Dugod}"
REGION="${2:-us-east-1}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="$ROOT_DIR/Backend"

ACCOUNT_ID="788184849448"
ECR_REPO="dugod-api"
CLUSTER_NAME="dugod-cluster"
SERVICE_NAME="dugod-api-service"
TASK_FAMILY="dugod-api-task"
CONTAINER_NAME="dugod-api-container"
CONTAINER_PORT="80"
FORCE_APP_PORT="${FORCE_APP_PORT:-80}"
CPU="512"
MEMORY="1024"
LOG_GROUP="/ecs/dugod-api"
EXEC_ROLE_NAME="dugod-ecs-execution-role"
TASK_ROLE_NAME="dugod-ecs-task-role"
ENV_FILE="$APP_DIR/.env.development"

# Use known-good network from current account resources unless overridden
SUBNETS="${SUBNETS:-subnet-098222446b4eecd5d,subnet-0aa5d166635a6b671}"
SECURITY_GROUPS="${SECURITY_GROUPS:-sg-0ea1d8546e2ff0d8d}"

IMAGE_TAG="${IMAGE_TAG:-$(git -C "$ROOT_DIR" rev-parse --short=12 HEAD)}"
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
IMAGE_URI="$ECR_REGISTRY/$ECR_REPO:$IMAGE_TAG"
DOCKER_PLATFORM="${DOCKER_PLATFORM:-linux/amd64}"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1" >&2; exit 1; }
}

need_cmd aws
need_cmd docker
need_cmd python3

"$ROOT_DIR/scripts/ops/dugod-preflight.sh" "$PROFILE" "$REGION"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

echo "[DEPLOY] Ensuring ECR repository exists"
if ! AWS_PAGER="" aws ecr describe-repositories --profile "$PROFILE" --region "$REGION" --repository-names "$ECR_REPO" >/dev/null 2>&1; then
  AWS_PAGER="" aws ecr create-repository --profile "$PROFILE" --region "$REGION" --repository-name "$ECR_REPO" >/dev/null
fi

echo "[DEPLOY] Ensuring CloudWatch log group exists"
if ! AWS_PAGER="" aws logs describe-log-groups --profile "$PROFILE" --region "$REGION" --log-group-name-prefix "$LOG_GROUP" --query 'logGroups[?logGroupName==`'"$LOG_GROUP"'`].logGroupName' --output text | grep -q "$LOG_GROUP"; then
  AWS_PAGER="" aws logs create-log-group --profile "$PROFILE" --region "$REGION" --log-group-name "$LOG_GROUP" || true
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

cat > "$TMP_DIR/trust-policy.json" <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }
  ]
}
JSON

echo "[DEPLOY] Ensuring ECS execution/task roles exist"
if ! AWS_PAGER="" aws iam get-role --profile "$PROFILE" --role-name "$EXEC_ROLE_NAME" >/dev/null 2>&1; then
  AWS_PAGER="" aws iam create-role --profile "$PROFILE" --role-name "$EXEC_ROLE_NAME" --assume-role-policy-document "file://$TMP_DIR/trust-policy.json" >/dev/null
fi
AWS_PAGER="" aws iam attach-role-policy --profile "$PROFILE" --role-name "$EXEC_ROLE_NAME" --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy >/dev/null || true

if ! AWS_PAGER="" aws iam get-role --profile "$PROFILE" --role-name "$TASK_ROLE_NAME" >/dev/null 2>&1; then
  AWS_PAGER="" aws iam create-role --profile "$PROFILE" --role-name "$TASK_ROLE_NAME" --assume-role-policy-document "file://$TMP_DIR/trust-policy.json" >/dev/null
fi

EXEC_ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$EXEC_ROLE_NAME"
TASK_ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$TASK_ROLE_NAME"

echo "[DEPLOY] Ensuring ECS cluster exists"
if ! AWS_PAGER="" aws ecs describe-clusters --profile "$PROFILE" --region "$REGION" --clusters "$CLUSTER_NAME" --query 'clusters[0].clusterName' --output text 2>/dev/null | grep -q "$CLUSTER_NAME"; then
  AWS_PAGER="" aws ecs create-cluster --profile "$PROFILE" --region "$REGION" --cluster-name "$CLUSTER_NAME" >/dev/null
fi

echo "[DEPLOY] Building and pushing Docker image: $IMAGE_URI"
if [[ "${SKIP_BUILD:-0}" == "1" ]]; then
  echo "[DEPLOY] SKIP_BUILD=1, reusing existing image: $IMAGE_URI"
else
  AWS_PAGER="" aws ecr get-login-password --profile "$PROFILE" --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

  if docker buildx version >/dev/null 2>&1; then
    echo "[DEPLOY] Using buildx for platform $DOCKER_PLATFORM"
    docker buildx build \
      --platform "$DOCKER_PLATFORM" \
      --provenance=false \
      -t "$IMAGE_URI" \
      --push \
      "$APP_DIR"
  else
    echo "[DEPLOY] buildx unavailable; falling back to docker build/push (may cause arch mismatch on Apple Silicon)"
    docker build -t "$IMAGE_URI" "$APP_DIR"
    docker push "$IMAGE_URI"
  fi
fi

echo "[DEPLOY] Generating task definition payload"
python3 - "$ENV_FILE" "$IMAGE_URI" "$CONTAINER_NAME" "$CONTAINER_PORT" "$EXEC_ROLE_ARN" "$TASK_ROLE_ARN" "$CPU" "$MEMORY" "$LOG_GROUP" "$REGION" "$TASK_FAMILY" "$TMP_DIR/taskdef.json" "$FORCE_APP_PORT" <<'PY'
import json, sys
env_file, image_uri, cname, cport, exec_role, task_role, cpu, mem, log_group, region, family, out, forced_port = sys.argv[1:]

env = []
with open(env_file, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' not in line:
            continue
        k, v = line.split('=', 1)
        key = k.strip().lstrip('\ufeff')
        if key == 'PORT':
            continue
        env.append({"name": key, "value": v.strip()})

env.append({"name": "PORT", "value": str(forced_port)})

payload = {
  "family": family,
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": cpu,
  "memory": mem,
  "executionRoleArn": exec_role,
  "taskRoleArn": task_role,
  "containerDefinitions": [
    {
      "name": cname,
      "image": image_uri,
      "essential": True,
      "portMappings": [{"containerPort": int(cport), "hostPort": int(cport), "protocol": "tcp"}],
      "environment": env,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": log_group,
          "awslogs-region": region,
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}

with open(out, 'w', encoding='utf-8') as wf:
    json.dump(payload, wf)
PY

TASKDEF_ARN="$(AWS_PAGER="" aws ecs register-task-definition --profile "$PROFILE" --region "$REGION" --cli-input-json "file://$TMP_DIR/taskdef.json" --query 'taskDefinition.taskDefinitionArn' --output text)"
echo "[DEPLOY] Registered task definition: $TASKDEF_ARN"

IFS=',' read -r -a SUBNET_ARR <<< "$SUBNETS"
IFS=',' read -r -a SG_ARR <<< "$SECURITY_GROUPS"

SUBNETS_JSON="$(printf '"%s",' "${SUBNET_ARR[@]}" | sed 's/,$//')"
SG_JSON="$(printf '"%s",' "${SG_ARR[@]}" | sed 's/,$//')"

echo "[DEPLOY] Ensuring ECS service exists/updated"
if AWS_PAGER="" aws ecs describe-services --profile "$PROFILE" --region "$REGION" --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" --query 'services[0].status' --output text 2>/dev/null | grep -q ACTIVE; then
  AWS_PAGER="" aws ecs update-service --profile "$PROFILE" --region "$REGION" --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --task-definition "$TASKDEF_ARN" --force-new-deployment >/dev/null
else
  AWS_PAGER="" aws ecs create-service \
    --profile "$PROFILE" \
    --region "$REGION" \
    --cluster "$CLUSTER_NAME" \
    --service-name "$SERVICE_NAME" \
    --task-definition "$TASKDEF_ARN" \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS_JSON],securityGroups=[$SG_JSON],assignPublicIp=ENABLED}" >/dev/null
fi

echo "[DEPLOY] Waiting for service stability"
AWS_PAGER="" aws ecs wait services-stable --profile "$PROFILE" --region "$REGION" --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME"

echo "[DEPLOY] Final service summary"
AWS_PAGER="" aws ecs describe-services --profile "$PROFILE" --region "$REGION" --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" --query 'services[0].{status:status,desired:desiredCount,running:runningCount,taskDefinition:taskDefinition}' --output table

echo "[DEPLOY] DONE"
