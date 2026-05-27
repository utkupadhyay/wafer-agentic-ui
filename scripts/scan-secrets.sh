#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$repo_root"

echo "Running secret scan..."

run_gitleaks_scan() {
  if gitleaks git --help >/dev/null 2>&1; then
    gitleaks git --no-banner --redact --exit-code 1 .
    return $?
  fi

  if gitleaks detect --help >/dev/null 2>&1; then
    gitleaks detect --no-banner --redact --exit-code 1 --source .
    return $?
  fi

  if gitleaks dir --help >/dev/null 2>&1; then
    gitleaks dir --no-banner --redact --exit-code 1 .
    return $?
  fi

  return 2
}

if command -v gitleaks >/dev/null 2>&1; then
  set +e
  run_gitleaks_scan
  scan_status=$?
  set -e

  if [ "$scan_status" -eq 0 ]; then
    echo "No secrets detected by gitleaks."
    exit 0
  fi

  echo "Potential secrets detected by gitleaks. Push blocked."
  exit "$scan_status"
fi

echo "gitleaks is not installed. Running fallback heuristic scan."

set +e
rg --line-number --hidden --pcre2 --no-messages --color never \
  --glob '!.git/**' \
  --glob '!node_modules/**' \
  --glob '!.pnpm-store/**' \
  --glob '!dist/**' \
  --glob '!coverage/**' \
  --glob '!pnpm-lock.yaml' \
  -e '-----BEGIN (RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY-----' \
  -e 'AKIA[0-9A-Z]{16}' \
  -e 'ASIA[0-9A-Z]{16}' \
  -e 'ghp_[A-Za-z0-9]{36}' \
  -e 'github_pat_[A-Za-z0-9_]{20,}' \
  -e 'xox[baprs]-[A-Za-z0-9-]{20,}' \
  -e 'sk-[A-Za-z0-9]{20,}' \
  -e 'AIza[0-9A-Za-z_-]{35}' \
  .
fallback_status=$?
set -e

if [ "$fallback_status" -eq 0 ]; then
  echo "Potential secrets detected by fallback scan. Push blocked."
  echo "Install gitleaks for deeper scanning: https://github.com/gitleaks/gitleaks"
  exit 1
fi

if [ "$fallback_status" -eq 1 ]; then
  echo "Fallback scan found no obvious secrets."
  echo "Tip: install gitleaks for stronger protection."
  exit 0
fi

echo "Fallback scan failed unexpectedly."
exit "$fallback_status"
