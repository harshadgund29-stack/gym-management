@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%backend"
if exist "%SCRIPT_DIR%apache-maven-3.9.8\bin\mvn.cmd" (
    "%SCRIPT_DIR%apache-maven-3.9.8\bin\mvn.cmd" clean compile 2>&1
) else (
    if defined MAVEN_HOME (
        set "PATH=%MAVEN_HOME%\bin;%PATH%"
    )
    mvn clean compile 2>&1
)
endlocal
