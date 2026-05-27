#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if [ ! -f ".githooks/pre-push" ]; then
  echo "Missing .githooks/pre-push hook."
  exit 1
fi

chmod +x .githooks/pre-push scripts/scan-secrets.sh
git config core.hooksPath .githooks

echo "Git hooks installed."
echo "Pre-push hook path: $(git config core.hooksPath)"
