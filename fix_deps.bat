@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%frontend"
echo Installing missing frontend dependencies...
npm install @apideck/better-ajv-errors --save-dev
echo Done.
pause
endlocal
