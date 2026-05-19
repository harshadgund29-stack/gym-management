#!/usr/bin/env bash
# =============================================================================
# acceptance-tests.sh — FitPro Gym Management System
# Bash acceptance tests. Each command is separate (no && chaining).
# Run from the repo root after starting the backend on port 8080.
# =============================================================================

BASE="http://localhost:8080"
PASS=0
FAIL=0
TOKEN=""
MEMBER_TOKEN=""

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

run_test() {
    local name="$1"
    local result="$2"
    local expected="$3"
    echo -e "\n${CYAN}=== ${name} ===${NC}"
    if echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}PASS: ${name}${NC}"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}FAIL: ${name}${NC}"
        echo "  Response: $result"
        FAIL=$((FAIL + 1))
    fi
}

# ── 1. Health check ───────────────────────────────────────────────────────────
RESULT=$(curl -s "$BASE/actuator/health")
run_test "Health Check" "$RESULT" '"status":"UP"'

# ── 2. Login (admin) ──────────────────────────────────────────────────────────
RESULT=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123456"}')
run_test "POST /api/auth/login (admin)" "$RESULT" '"token"'
TOKEN=$(echo "$RESULT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# ── 3. Login (member) ─────────────────────────────────────────────────────────
RESULT=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"member@fitpro.com","password":"member123"}')
run_test "POST /api/auth/login (member)" "$RESULT" '"token"'
MEMBER_TOKEN=$(echo "$RESULT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# ── 4. Login (trainer) ────────────────────────────────────────────────────────
RESULT=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer@fitpro.com","password":"trainer123"}')
run_test "POST /api/auth/login (trainer)" "$RESULT" '"token"'

# ── 5. Forgot password (OTP email) ────────────────────────────────────────────
RESULT=$(curl -s -X POST "$BASE/api/users/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"harshadgund29@gmail.com"}')
run_test "POST /api/users/forgot-password" "$RESULT" '"message"'

echo -e "\n${CYAN}NOTE:${NC} Check Gmail Sent/Inbox for the OTP for harshadgund29@gmail.com.\n"

action_otp=""

# ── 6. Verify OTP endpoint (using wrong OTP should fail) ────────────────────
VERIFY_RAW=$(curl -s -X POST "$BASE/api/users/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"email":"harshadgund29@gmail.com","otp":999999}' \
  -w "\n%{http_code}")
STATUS=$(echo "$VERIFY_RAW" | tail -n 1)
BODY=$(echo "$VERIFY_RAW" | head -n -1)

if [ "$STATUS" = "400" ]; then
  echo -e "\n${GREEN}PASS: POST /api/users/verify-otp (wrong OTP fails)${NC}"
  PASS=$((PASS + 1))
else
  echo -e "\n${RED}FAIL: POST /api/users/verify-otp${NC}"
  echo "  Status: $STATUS"
  echo "  Body: $BODY"
  FAIL=$((FAIL + 1))
fi

# ── 7. Reset password endpoint health (endpoint wiring) ─────────────────────
# /api/users/reset-password requires OTP verification in the correct flow.
# This script does not read OTP from Gmail; it validates the endpoint wiring.
RESET_RAW=$(curl -s -X POST "$BASE/api/users/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"harshadgund29@gmail.com","token":"dummy","newPassword":"HarshadTemp@123"}' \
  -w "\n%{http_code}")
STATUS=$(echo "$RESET_RAW" | tail -n 1)
BODY=$(echo "$RESET_RAW" | head -n -1)

if [ "$STATUS" = "200" ] || [ "$STATUS" = "400" ]; then
  echo -e "\n${GREEN}PASS: POST /api/users/reset-password (health) status=$STATUS${NC}"
  PASS=$((PASS + 1))
else
  echo -e "\n${RED}FAIL: POST /api/users/reset-password${NC}"
  echo "  Status: $STATUS"
  echo "  Body: $BODY"
  FAIL=$((FAIL + 1))
fi

# ── 8. Plans active (no JWT) ──────────────────────────────────────────────────
RESULT=$(curl -s "$BASE/api/plans/active")
run_test "GET /api/plans/active (no JWT)" "$RESULT" '"id"'

# ── 9. Plans active (with JWT) ───────────────────────────────────────────────
RESULT=$(curl -s "$BASE/api/plans/active" \
  -H "Authorization: Bearer $MEMBER_TOKEN")
run_test "GET /api/plans/active (with JWT)" "$RESULT" '"id"'

# ── 10. Attendance mark ─────────────────────────────────────────────────────
RESULT=$(curl -s -X POST "$BASE/api/attendance/mark" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json")
run_test "POST /api/attendance/mark" "$RESULT" '"id"'

# ── 11. Attendance my ─────────────────────────────────────────────────────────
RESULT=$(curl -s "$BASE/api/attendance/my" \
  -H "Authorization: Bearer $MEMBER_TOKEN")
run_test "GET /api/attendance/my" "$RESULT" '\['

# ── 12. Attendance my/count ──────────────────────────────────────────────────
RESULT=$(curl -s "$BASE/api/attendance/my/count" \
  -H "Authorization: Bearer $MEMBER_TOKEN")
run_test "GET /api/attendance/my/count" "$RESULT" '"count"'

# ── 13. Users members (admin) ─────────────────────────────────────────────────
RESULT=$(curl -s "$BASE/api/users/members" \
  -H "Authorization: Bearer $TOKEN")
run_test "GET /api/users/members (admin)" "$RESULT" '\['

# ── 14. Users trainers (admin) ────────────────────────────────────────────────
RESULT=$(curl -s "$BASE/api/users/trainers" \
  -H "Authorization: Bearer $TOKEN")
run_test "GET /api/users/trainers (admin)" "$RESULT" '\['

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "============================================"
if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}Results: $PASS passed, $FAIL failed${NC}"
else
    echo -e "${RED}Results: $PASS passed, $FAIL failed${NC}"
fi
echo "============================================"
[ "$FAIL" -eq 0 ]

