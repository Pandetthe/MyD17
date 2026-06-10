#!/usr/bin/env bash
set -euo pipefail

# run-zap.sh — Local ZAP scan runner
# Usage:
#   ./security/scripts/run-zap.sh [baseline|full]
# Env vars:
#   TARGET_URL    (default: http://localhost:1337)
#   ZAP_AUTH_USER (default: jan.nowak@example.com — seeded user)
#   ZAP_AUTH_PASS (default: SecurePassword123!)
#   REPORT_DIR    (default: ./security/reports)

SCAN_TYPE="${1:-baseline}"
TARGET_URL="${TARGET_URL:-http://localhost:1337}"
ZAP_AUTH_USER="${ZAP_AUTH_USER:-jan.nowak@example.com}"
ZAP_AUTH_PASS="${ZAP_AUTH_PASS:-SecurePassword123!}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPORT_DIR="${REPORT_DIR:-${REPO_ROOT}/security/reports}"
ZAP_IMAGE="ghcr.io/zaproxy/zaproxy:stable"

# HOST_CHECK_URL is used for the reachability check on the host machine.
# DOCKER_TARGET_URL is what ZAP inside the container uses to reach the host.
HOST_CHECK_URL="${TARGET_URL}"
DOCKER_TARGET_URL="${TARGET_URL}"

# On macOS, --network host is not supported by Docker Desktop.
# The container must use host.docker.internal instead of localhost,
# but the host-side reachability check must still use localhost.
if [[ "$(uname)" == "Darwin" ]]; then
    DOCKER_TARGET_URL="${TARGET_URL/localhost/host.docker.internal}"
fi

if [[ "${SCAN_TYPE}" == "baseline" ]]; then
    PLAN_FILE="baseline-plan.yaml"
    echo "[ZAP] Running BASELINE (passive) scan against ${DOCKER_TARGET_URL}"
elif [[ "${SCAN_TYPE}" == "full" ]]; then
    PLAN_FILE="full-scan-plan.yaml"
    echo "[ZAP] Running FULL (active) scan against ${DOCKER_TARGET_URL}"
    echo "[ZAP] WARNING: This scan sends attack payloads. Only run against a disposable environment."
    read -r -p "Continue? [y/N] " confirm
    if [[ "${confirm}" != "y" && "${confirm}" != "Y" ]]; then
        echo "Aborted."
        exit 1
    fi
else
    echo "Unknown scan type: '${SCAN_TYPE}'. Use 'baseline' or 'full'."
    exit 1
fi

mkdir -p "${REPORT_DIR}"

if ! curl -sf --max-time 5 "${HOST_CHECK_URL}/api/posts" > /dev/null 2>&1; then
    echo "[ZAP] ERROR: Target ${HOST_CHECK_URL} is not reachable. Start Strapi first."
    exit 1
fi

echo "[ZAP] Target: ${DOCKER_TARGET_URL}"
echo "[ZAP] Plan:   ${PLAN_FILE}"
echo "[ZAP] Output: ${REPORT_DIR}"
echo ""

NETWORK_FLAG=""
if [[ "$(uname)" != "Darwin" ]]; then
    NETWORK_FLAG="--network host"
fi

OPENAPI_SRC="${REPO_ROOT}/apps/strapi/src/extensions/documentation/documentation/1.0.0/full_documentation.json"
OPENAPI_PATCHED="${REPORT_DIR}/openapi-patched.json"

# Patch the Strapi-generated spec to fix ZAP validation issues:
# 1. contact.url missing scheme  2. /upload?id={id} has query param in path key
python3 - <<EOF
import json
with open("${OPENAPI_SRC}") as f:
    spec = json.load(f)
spec["info"]["contact"]["url"] = "https://" + spec["info"]["contact"]["url"].lstrip("https://").lstrip("http://")
if "/upload?id={id}" in spec["paths"]:
    spec["paths"]["/upload"] = spec["paths"].pop("/upload?id={id}")
with open("${OPENAPI_PATCHED}", "w") as f:
    json.dump(spec, f, indent=2)
EOF

# shellcheck disable=SC2086
docker run --rm \
    ${NETWORK_FLAG} \
    -e TARGET_URL="${DOCKER_TARGET_URL}" \
    -e REPORT_DIR="/zap/reports" \
    -e ZAP_AUTH_USER="${ZAP_AUTH_USER}" \
    -e ZAP_AUTH_PASS="${ZAP_AUTH_PASS}" \
    -v "${REPO_ROOT}/security:/zap/security:ro" \
    -v "${REPORT_DIR}:/zap/reports:rw" \
    -v "${OPENAPI_PATCHED}:/zap/openapi/full_documentation.json:ro" \
    "${ZAP_IMAGE}" \
    zap.sh -cmd -autorun "/zap/security/zap/${PLAN_FILE}"

echo ""
echo "[ZAP] Scan complete. Reports:"
ls -lh "${REPORT_DIR}"/*.html "${REPORT_DIR}"/*.json 2>/dev/null || true
