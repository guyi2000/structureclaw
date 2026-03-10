#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$ROOT_DIR/scripts/dev-up.sh"

assert_contains() {
  local pattern="$1"
  local message="$2"
  if ! rg -q "$pattern" "$TARGET"; then
    echo "[fail] $message"
    exit 1
  fi
}

echo "Validating startup self-healing guards..."

assert_contains "ensure_npm_dependencies\\(" "missing npm dependency self-healing function"
assert_contains "lock_snapshot" "missing lockfile snapshot drift detection"
assert_contains "core_module_available \"uvicorn\"" "missing core uvicorn guard"
assert_contains "reset_frontend_cache_if_needed" "missing frontend cache recovery hook"
assert_contains "Cannot find module '\\./" "missing frontend chunk corruption detection signature"
assert_contains "starting %s" "missing session header for log isolation"

echo "[ok] startup self-healing guards are present"
