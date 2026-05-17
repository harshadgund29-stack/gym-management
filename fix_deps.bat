@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%frontend"
if exist "%SYSTEMROOT%\System32\npm.cmd" (
    npm.cmd install @apideck/better-ajv-errors --save-dev
) else (
    npm install @apideck/better-ajv-errors --save-dev
)
echo Done.
pause
endlocal
