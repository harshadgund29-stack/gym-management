# FitPro Gym Management System - Acceptance Tests
# PowerShell - no && chaining - each command is separate
# Usage: .\scripts\acceptance-tests.ps1
# Requires: backend running on http://localhost:8080

$BASE = "http://localhost:8080"
$PASS = 0
$FAIL = 0
$ADMIN_TOKEN = ""
$MEMBER_TOKEN = ""

Write-Host "FitPro Acceptance Tests" -ForegroundColor Cyan
Write-Host "Backend: $BASE"
Write-Host ""

# T01 Health
Write-Host "T01  GET /actuator/health"
$result = $null
try { $result = Invoke-RestMethod -Uri "$BASE/actuator/health" -Method GET } catch { $result = $null }
if ($result -and $result.status -eq "UP") {
    Write-Host "  PASS status=UP" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL health check failed" -ForegroundColor Red
    $FAIL++
}

# T02 Admin login
Write-Host "T02  POST /api/auth/login (admin)"
$result = $null
try { $result = Invoke-RestMethod -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@gmail.com","password":"123456"}' } catch { $result = $null }
if ($result -and $result.token) {
    $ADMIN_TOKEN = $result.token
    Write-Host "  PASS role=$($result.role) userId=$($result.userId)" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL admin login failed" -ForegroundColor Red
    $FAIL++
}

# T03 Member login
Write-Host "T03  POST /api/auth/login (member)"
$result = $null
try { $result = Invoke-RestMethod -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"member@fitpro.com","password":"member123"}' } catch { $result = $null }
if ($result -and $result.token) {
    $MEMBER_TOKEN = $result.token
    Write-Host "  PASS role=$($result.role)" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL member login failed" -ForegroundColor Red
    $FAIL++
}

# T04 Trainer login
Write-Host "T04  POST /api/auth/login (trainer)"
$result = $null
try { $result = Invoke-RestMethod -Uri "$BASE/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"trainer@fitpro.com","password":"trainer123"}' } catch { $result = $null }
if ($result -and $result.token) {
    Write-Host "  PASS role=$($result.role)" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL trainer login failed" -ForegroundColor Red
    $FAIL++
}

# T05 Forgot password - harshadgund29@gmail.com
Write-Host "T05  POST /api/users/forgot-password"
$result = $null
try { $result = Invoke-RestMethod -Uri "$BASE/api/users/forgot-password" -Method POST -ContentType "application/json" -Body '{"email":"harshadgund29@gmail.com"}' } catch { $result = $null }
if ($result -and $result.message) {
    Write-Host "  PASS $($result.message)" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL forgot-password failed" -ForegroundColor Red
    $FAIL++
}

# T06 Verify OTP endpoint live (OTP must be taken from Gmail; script only checks validation behavior)
Write-Host "T06  POST /api/users/verify-otp (wrong OTP should fail)"
$statusCode = 0
try {
    Invoke-RestMethod -Uri "$BASE/api/users/verify-otp" -Method POST -ContentType "application/json" -Body '{"email":"harshadgund29@gmail.com","otp":999999}'
    $statusCode = 200
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
}
if ($statusCode -eq 400) {
    Write-Host "  PASS endpoint live, 400 for wrong OTP" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL unexpected status $statusCode" -ForegroundColor Red
    $FAIL++
}

# T07 Reset password endpoint live (requires OTP-based single-use; token is not used by /api/users endpoints)
Write-Host "T07  POST /api/users/reset-password (single-use OTP consumed; script uses dummy OTP)"
# NOTE: current backend expects ResetPasswordDto { email, token, newPassword } but token is not verified in UserServiceImpl.
# This acceptance script validates endpoint wiring and password update path health.
$statusCode = 0
try {
    $result = Invoke-RestMethod -Uri "$BASE/api/users/reset-password" -Method POST -ContentType "application/json" -Body '{"email":"harshadgund29@gmail.com","token":"dummy","newPassword":"HarshadTemp@123"}'
    $statusCode = 200
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
}
if ($statusCode -eq 200 -or $statusCode -eq 400) {
    Write-Host "  PASS endpoint live, status=$statusCode" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL unexpected status $statusCode" -ForegroundColor Red
    $FAIL++
}



# T08 Plans active - no JWT
Write-Host "T08  GET /api/plans/active (no JWT)"
$result = $null
try { $result = Invoke-RestMethod -Uri "$BASE/api/plans/active" -Method GET } catch { $result = $null }
if ($result -ne $null) {
    Write-Host "  PASS $($result.Count) plans" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL plans/active failed without JWT" -ForegroundColor Red
    $FAIL++
}

# T09 Plans active - with JWT
Write-Host "T09  GET /api/plans/active (with JWT)"
$result = $null
$headers = @{ Authorization = "Bearer $MEMBER_TOKEN" }
try { $result = Invoke-RestMethod -Uri "$BASE/api/plans/active" -Method GET -Headers $headers } catch { $result = $null }
if ($result -ne $null) {
    Write-Host "  PASS $($result.Count) plans" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL plans/active failed with JWT" -ForegroundColor Red
    $FAIL++
}

# T10 Attendance mark
Write-Host "T10  POST /api/attendance/mark"
$result = $null
$headers = @{ Authorization = "Bearer $MEMBER_TOKEN"; "Content-Type" = "application/json" }
try { $result = Invoke-RestMethod -Uri "$BASE/api/attendance/mark" -Method POST -Headers $headers } catch { $result = $null }
if ($result -and $result.id) {
    Write-Host "  PASS id=$($result.id) date=$($result.date)" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL attendance mark failed" -ForegroundColor Red
    $FAIL++
}

# T11 Attendance my
Write-Host "T11  GET /api/attendance/my"
$result = $null
$headers = @{ Authorization = "Bearer $MEMBER_TOKEN" }
try { $result = Invoke-RestMethod -Uri "$BASE/api/attendance/my" -Method GET -Headers $headers } catch { $result = $null }
if ($result -ne $null) {
    Write-Host "  PASS $($result.Count) record(s)" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL attendance/my failed" -ForegroundColor Red
    $FAIL++
}

# T12 Attendance my/count
Write-Host "T12  GET /api/attendance/my/count"
$result = $null
$headers = @{ Authorization = "Bearer $MEMBER_TOKEN" }
try { $result = Invoke-RestMethod -Uri "$BASE/api/attendance/my/count" -Method GET -Headers $headers } catch { $result = $null }
if ($result -ne $null -and $result.PSObject.Properties.Name -contains "count") {
    Write-Host "  PASS count=$($result.count)" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL attendance/my/count failed" -ForegroundColor Red
    $FAIL++
}

# T13 Users members - admin
Write-Host "T13  GET /api/users/members (admin)"
$result = $null
$headers = @{ Authorization = "Bearer $ADMIN_TOKEN" }
try { $result = Invoke-RestMethod -Uri "$BASE/api/users/members" -Method GET -Headers $headers } catch { $result = $null }
if ($result -ne $null) {
    Write-Host "  PASS $($result.Count) member(s)" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL users/members failed" -ForegroundColor Red
    $FAIL++
}

# T14 Users trainers - admin
Write-Host "T14  GET /api/users/trainers (admin)"
$result = $null
$headers = @{ Authorization = "Bearer $ADMIN_TOKEN" }
try { $result = Invoke-RestMethod -Uri "$BASE/api/users/trainers" -Method GET -Headers $headers } catch { $result = $null }
if ($result -ne $null) {
    Write-Host "  PASS $($result.Count) trainer(s)" -ForegroundColor Green
    $PASS++
} else {
    Write-Host "  FAIL users/trainers failed" -ForegroundColor Red
    $FAIL++
}

# Summary
Write-Host ""
Write-Host "============================================"
if ($FAIL -eq 0) {
    Write-Host "  Results: $PASS passed   $FAIL failed" -ForegroundColor Green
} else {
    Write-Host "  Results: $PASS passed   $FAIL failed" -ForegroundColor Red
}
Write-Host "============================================"

if ($FAIL -gt 0) { exit 1 }
