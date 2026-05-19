@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "MVN=%SCRIPT_DIR%apache-maven-3.9.8\bin\mvn.cmd"

echo ============================================================
echo  FitPro Gym Management System — Full Startup
echo ============================================================
echo.
echo  IMPORTANT: Set your secrets below before running.
echo  Never commit this file with real values filled in.
echo  Use placeholder <<...>> to remind yourself what to fill.
echo ============================================================
echo.

:: ── SECRETS — fill these in before running ───────────────────
:: Database
set "DB_USERNAME=root"
set "DB_PASSWORD=harshadgund@25"

:: JWT — generate a strong base64 secret (min 32 bytes)
set "JWT_SECRET=gym_management_super_secret_key_change_this_in_production_must_be_at_least_256_bits"

:: Gmail SMTP — use a 16-char Google App Password (NOT your login password)
:: Generate at: https://myaccount.google.com/apppasswords
set "SPRING_MAIL_USERNAME=harshadgund29@gmail.com"
set "SPRING_MAIL_PASSWORD=idtgshyrtzzizzjq"

:: Cashfree — get from https://merchant.cashfree.com → API Keys
:: Set CASHFREE_ENV=SANDBOX for testing, PRODUCTION for live
set "CASHFREE_APP_ID=TEST110802038d5c8933cb13ae23909b30208011"
set "CASHFREE_SECRET_KEY=cfsk_ma_test_fbd16c6389aa0916c85ff37161bf017d_44be63b"
set "CASHFREE_ENV=SANDBOX"
set "CASHFREE_WEBHOOK_SECRET="

:: PayPal — get from https://developer.paypal.com → My Apps → Sandbox
:: Both client ID and client secret are required for server-side PayPal API calls
set "PAYPAL_SANDBOX_CLIENT_ID=AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqIgmkgl7de4copFTa2DbHLDHe6ZL8jkdY"
set "PAYPAL_SANDBOX_CLIENT_SECRET="

:: ── Validate critical secrets ─────────────────────────────────
if "%SPRING_MAIL_PASSWORD%"=="" (
    echo ERROR: SPRING_MAIL_PASSWORD is not set.
    echo        Email sending will fail at runtime.
    echo        Set it to your 16-char Google App Password above.
    pause
    exit /b 1
)
if "%DB_PASSWORD%"=="" (
    echo ERROR: DB_PASSWORD is not set.
    pause
    exit /b 1
)

echo Secrets loaded. Starting...
echo.

:: ── Step 1: Build backend ─────────────────────────────────────
echo [1/3] Building backend...
cd /d "%SCRIPT_DIR%backend"
if exist "%MVN%" (
    "%MVN%" clean install -DskipTests -q
) else (
    mvn clean install -DskipTests -q
)
if errorlevel 1 (
    echo ERROR: Backend build failed. Check output above.
    pause
    exit /b 1
)
echo       Backend build OK.
echo.

:: ── Step 2: Install frontend dependencies ─────────────────────
echo [2/3] Installing frontend dependencies...
cd /d "%SCRIPT_DIR%frontend"
npm install --legacy-peer-deps --silent
if errorlevel 1 (
    echo ERROR: Frontend install failed. Check output above.
    pause
    exit /b 1
)
echo       Frontend dependencies OK.
echo.

:: ── Step 3: Start backend in a new window (env vars inherited) ─
echo [3/3] Starting backend on http://localhost:8080 ...
cd /d "%SCRIPT_DIR%backend"
if exist "%MVN%" (
    start "FitPro Backend" cmd /k "set DB_USERNAME=%DB_USERNAME% && set DB_PASSWORD=%DB_PASSWORD% && set JWT_SECRET=%JWT_SECRET% && set SPRING_MAIL_USERNAME=%SPRING_MAIL_USERNAME% && set SPRING_MAIL_PASSWORD=%SPRING_MAIL_PASSWORD% && set CASHFREE_APP_ID=%CASHFREE_APP_ID% && set CASHFREE_SECRET_KEY=%CASHFREE_SECRET_KEY% && set CASHFREE_ENV=%CASHFREE_ENV% && set CASHFREE_WEBHOOK_SECRET=%CASHFREE_WEBHOOK_SECRET% && set PAYPAL_SANDBOX_CLIENT_ID=%PAYPAL_SANDBOX_CLIENT_ID% && set PAYPAL_SANDBOX_CLIENT_SECRET=%PAYPAL_SANDBOX_CLIENT_SECRET% && %MVN% spring-boot:run"
) else (
    start "FitPro Backend" cmd /k "set DB_PASSWORD=%DB_PASSWORD% && mvn spring-boot:run"
)

:: ── Step 4: Start frontend in a new window ────────────────────
echo       Starting frontend on http://localhost:5173 ...
cd /d "%SCRIPT_DIR%frontend"
start "FitPro Frontend" cmd /k "npm run dev"

echo.
echo ============================================================
echo  Both servers starting in separate windows.
echo  Backend:  http://localhost:8080
echo  Frontend: http://localhost:5173
echo.
echo  Demo credentials:
echo    Admin:   admin@gmail.com    / 123456
echo    Trainer: trainer@fitpro.com / trainer123
echo    Member:  member@fitpro.com  / member123
echo.
echo  SMTP check: http://localhost:8080/internal/smtp-status
echo  SMTP test:  http://localhost:8080/internal/test-email
echo ============================================================
echo.
pause
endlocal
