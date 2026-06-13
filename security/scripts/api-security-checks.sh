#!/usr/bin/env bash
set -euo pipefail

# api-security-checks.sh — OWASP API Top 10 checks for MyD17 Strapi API
# Usage: ./security/scripts/api-security-checks.sh
# Env vars:
#   TARGET_URL (default: http://localhost:1337)

TARGET_URL="${1:-${TARGET_URL:-http://localhost:1337}}"
PASS=0
FAIL=0
WARN=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass()    { echo -e "${GREEN}[PASS]${NC} $*"; PASS=$((PASS + 1)); }
fail()    { echo -e "${RED}[FAIL]${NC} $*"; FAIL=$((FAIL + 1)); }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; WARN=$((WARN + 1)); }
info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
section() { echo ""; echo -e "${BLUE}══════════════════════════════════════${NC}"; echo -e "${BLUE}  $*${NC}"; echo -e "${BLUE}══════════════════════════════════════${NC}"; }

http_status() { curl -sk -o /dev/null -w "%{http_code}" "$@" 2>/dev/null; }
response_body() { curl -sfk "$@" 2>/dev/null || true; }

# ── Connectivity ──────────────────────────────────────────────────────────────

section "Connectivity"
status=$(http_status "${TARGET_URL}/api/posts")
if [[ "${status}" == "200" ]]; then
    pass "Strapi reachable at ${TARGET_URL}"
else
    fail "Strapi NOT reachable at ${TARGET_URL} (HTTP ${status}). Aborting."
    exit 1
fi

# ── API8: Security Misconfiguration — HTTP headers ────────────────────────────

section "API8: Security Headers"

check_header() {
    local header="$1"
    local value
    value=$(curl -skI "${TARGET_URL}/api/posts" 2>/dev/null | grep -i "^${header}:" | head -1)
    if [[ -n "${value}" ]]; then
        pass "Header present: ${value}"
    else
        fail "Missing security header: ${header}"
    fi
}

check_header "X-Content-Type-Options"
check_header "X-Frame-Options"
check_header "Strict-Transport-Security"
check_header "Content-Security-Policy"
check_header "Referrer-Policy"

powered_by=$(curl -skI "${TARGET_URL}/api/posts" 2>/dev/null | grep -i "^X-Powered-By:" | head -1 || true)
if [[ -z "${powered_by}" ]]; then
    pass "X-Powered-By header not exposed"
else
    fail "X-Powered-By header exposed: ${powered_by}"
fi

section "API8: CORS"
cors_origin=$(curl -skI -X OPTIONS "${TARGET_URL}/api/posts" \
    -H "Origin: https://evil.example.com" \
    -H "Access-Control-Request-Method: GET" 2>/dev/null \
    | grep -i "^Access-Control-Allow-Origin:" | head -1 || true)

if [[ -z "${cors_origin}" ]]; then
    pass "No ACAO header in OPTIONS preflight (no wildcard CORS)"
elif echo "${cors_origin}" | grep -q '\*'; then
    fail "CORS allows any origin (*): ${cors_origin}"
else
    info "CORS origin in preflight: ${cors_origin}"
fi

acao=$(curl -skI "${TARGET_URL}/api/posts" \
    -H "Origin: https://evil.example.com" 2>/dev/null \
    | grep -i "^Access-Control-Allow-Origin:" | head -1 || true)
if echo "${acao}" | grep -q "evil.example.com"; then
    fail "CORS reflects arbitrary origin: ${acao}"
elif echo "${acao}" | grep -q '\*'; then
    fail "CORS uses wildcard for simple request: ${acao}"
else
    pass "No arbitrary origin reflected in CORS simple request"
fi

# ── API8: OpenAPI / Swagger exposure ──────────────────────────────────────────

section "API8: Documentation Exposure"

docs_status=$(http_status "${TARGET_URL}/api/documentation/v1.0.0/api.json")
if [[ "${docs_status}" == "200" ]]; then
    fail "OpenAPI spec publicly accessible at /api/documentation/v1.0.0/api.json (disable plugin in production)"
else
    pass "OpenAPI spec not publicly accessible (HTTP ${docs_status})"
fi

swagger_status=$(http_status "${TARGET_URL}/documentation")
if [[ "${swagger_status}" == "200" || "${swagger_status}" == "301" || "${swagger_status}" == "302" ]]; then
    warn "Swagger UI accessible at /documentation (HTTP ${swagger_status}) — disabled automatically in NODE_ENV=production"
else
    pass "Swagger UI /documentation → HTTP ${swagger_status}"
fi

# ── Default Credentials ───────────────────────────────────────────────────────

section "Default Credentials (hardcoded in apps/strapi/src/index.ts)"

check_admin_login() {
    local email="$1" password="$2" role="$3"
    local status
    status=$(http_status -X POST "${TARGET_URL}/admin/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"${email}\",\"password\":\"${password}\"}")
    if [[ "${status}" == "200" ]]; then
        warn "Default ${role} credentials accepted (${email}) — seeding is skipped in NODE_ENV=production"
    elif [[ "${status}" == "400" || "${status}" == "401" ]]; then
        pass "Default ${role} credentials rejected (HTTP ${status}): ${email}"
    else
        warn "Unexpected HTTP ${status} for ${role} login: ${email}"
    fi
}

check_admin_login "admin@myd17.pl"      "Admin123!" "admin"
check_admin_login "employee@myd17.pl"   "Employee123!"      "employee"

# ── API2: Broken Authentication ───────────────────────────────────────────────

section "API2: JWT Algorithm Confusion (alg:none)"

FAKE_HEADER=$(printf '{"alg":"none","typ":"JWT"}' | base64 | tr '+/' '-_' | tr -d '=')
FAKE_PAYLOAD=$(printf '{"id":1,"role":"authenticated","iat":9999999999}' | base64 | tr '+/' '-_' | tr -d '=')
FAKE_JWT="${FAKE_HEADER}.${FAKE_PAYLOAD}."

status=$(http_status "${TARGET_URL}/api/users/me" \
    -H "Authorization: Bearer ${FAKE_JWT}")
if [[ "${status}" == "200" ]]; then
    fail "JWT alg:none accepted — authenticated as user id=1 without a valid signature"
else
    pass "JWT alg:none rejected (HTTP ${status})"
fi

section "API2: Brute-Force Protection"

brute_protected() {
    local endpoint="$1" body_template="$2" label="$3"
    local limited=0
    for i in $(seq 1 6); do
        local body="${body_template/ATTEMPT/$i}"
        local status
        status=$(http_status -X POST "${endpoint}" \
            -H "Content-Type: application/json" \
            -d "${body}")
        if [[ "${status}" == "429" ]]; then
            pass "Rate limit on ${label} triggered after ${i} attempts (HTTP 429)"
            limited=1
            break
        fi
    done
    if [[ "${limited}" -eq 0 ]]; then
        fail "No rate limiting on ${label} — 6 wrong-password attempts, no 429"
    fi
}

brute_protected \
    "${TARGET_URL}/api/auth/local" \
    '{"identifier":"jan.nowak@example.com","password":"Wrong_ATTEMPT"}' \
    "POST /api/auth/local"

brute_protected \
    "${TARGET_URL}/admin/login" \
    '{"email":"admin@myd17.pl","password":"WrongAdmin_ATTEMPT"}' \
    "POST /admin/login"

# ── API2: Admin panel exposure ────────────────────────────────────────────────

section "API2: Admin Panel Exposure"
admin_status=$(http_status "${TARGET_URL}/admin")
if [[ "${admin_status}" == "200" ]]; then
    warn "Admin panel accessible at /admin (HTTP 200) — restrict with IP allowlist in production"
else
    pass "Admin panel /admin → HTTP ${admin_status}"
fi

# ── API1: BOLA — User Enumeration ─────────────────────────────────────────────

section "API1: BOLA — Unauthenticated User Enumeration"

user1_status=$(http_status "${TARGET_URL}/api/users/1")
if [[ "${user1_status}" == "200" ]]; then
    fail "GET /api/users/1 returns HTTP 200 without auth (BOLA)"
else
    pass "GET /api/users/1 without auth → HTTP ${user1_status}"
fi

# ── API3: Mass Assignment ─────────────────────────────────────────────────────

section "API3: Mass Assignment on Like Endpoint"

first_post=$(curl -sfk "${TARGET_URL}/api/posts?pagination[limit]=1&fields[0]=documentId" 2>/dev/null \
    | grep -o '"documentId":"[^"]*"' | head -1 | cut -d'"' -f4 || true)

if [[ -n "${first_post}" ]]; then
    body=$(curl -sfk -X POST "${TARGET_URL}/api/posts/${first_post}/like" \
        -H "Content-Type: application/json" \
        -d '{"action":"like","likesCount":99999}' 2>/dev/null || true)
    injected=$(echo "${body}" | grep -o '"likesCount":[0-9]*' | cut -d: -f2 || true)
    if [[ "${injected}" == "99999" ]]; then
        fail "Mass assignment succeeded — likesCount set to 99999 via request body"
    elif [[ -n "${injected}" ]]; then
        pass "likesCount not overridden by body field (got: ${injected})"
    else
        warn "Could not parse likesCount from like endpoint response — check manually"
    fi
else
    warn "No posts found in database — skipping mass assignment test"
fi

# ── API6: Unrestricted Business Flow — Like Spam ──────────────────────────────

section "API6: Like Endpoint Spam (no auth, no rate limit)"

if [[ -n "${first_post:-}" ]]; then
    initial=$(curl -sfk "${TARGET_URL}/api/posts/${first_post}?fields[0]=likesCount" 2>/dev/null \
        | grep -o '"likesCount":[0-9]*' | cut -d: -f2 || echo "?")
    info "Initial likesCount for post ${first_post}: ${initial}"

    rate_limited=0
    for i in $(seq 1 20); do
        status=$(http_status -X POST "${TARGET_URL}/api/posts/${first_post}/like" \
            -H "Content-Type: application/json" \
            -d '{"action":"like"}')
        if [[ "${status}" == "429" ]]; then
            pass "Rate limit on like endpoint triggered after ${i} requests (HTTP 429)"
            rate_limited=1
            break
        fi
    done

    if [[ "${rate_limited}" -eq 0 ]]; then
        final=$(curl -sfk "${TARGET_URL}/api/posts/${first_post}?fields[0]=likesCount" 2>/dev/null \
            | grep -o '"likesCount":[0-9]*' | cut -d: -f2 || echo "?")
        fail "No rate limiting on POST /api/posts/:id/like — 20 requests all succeeded. likesCount: ${initial} → ${final}"
    fi
else
    warn "No posts found — skipping like spam test"
fi

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo -e "${BLUE}══════════════════════════════════════${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}══════════════════════════════════════${NC}"
echo -e "${GREEN}  PASS: ${PASS}${NC}"
echo -e "${YELLOW}  WARN: ${WARN}${NC}"
echo -e "${RED}  FAIL: ${FAIL}${NC}"
echo ""

if [[ ${FAIL} -gt 0 ]]; then
    echo -e "${RED}Security issues found. Review FAIL items above.${NC}"
    exit 1
else
    echo -e "${GREEN}No critical security failures detected.${NC}"
    exit 0
fi
