@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%frontend"
echo Installing frontend dependencies...
npm install --legacy-peer-deps
echo INSTALL_DONE
pause
endlocal
