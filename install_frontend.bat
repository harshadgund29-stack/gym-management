@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%frontend"
if exist "%SYSTEMROOT%\System32\npm.cmd" (
    npm.cmd install --legacy-peer-deps
) else (
    npm install --legacy-peer-deps
)
echo INSTALL_DONE
endlocal
