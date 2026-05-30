#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

for hook in pre-commit pre-push; do
  if [ ! -f ".githooks/$hook" ]; then
    echo "Missing .githooks/$hook hook."
    exit 1
  fi
done

chmod +x .githooks/pre-commit .githooks/pre-push scripts/scan-secrets.sh
git config core.hooksPath .githooks

echo "Git hooks installed."
echo "Hooks path: $(git config core.hooksPath)"
