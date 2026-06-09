#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_ENV="${SOURCE_ENV:-$ROOT_DIR/.env.development}"
OUT_FILE="${OUT_FILE:-$ROOT_DIR/temp-env.txt}"

if [[ ! -f "$SOURCE_ENV" ]]; then
  echo "Missing source env file: $SOURCE_ENV" >&2
  echo "Set SOURCE_ENV to a local env file and rerun." >&2
  exit 1
fi

cp "$SOURCE_ENV" "$OUT_FILE"

echo "Environment file copied to: $OUT_FILE"
echo "Use this file for secure transfer to your host."
