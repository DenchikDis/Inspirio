@echo off
chcp 65001 >nul
echo Starting local server...
echo.

:: Ищем npx: сначала в PATH, потом в типичных путях установки Node.js
set "NPX=npx"
where npx >nul 2>&1 || set "NPX="
if not defined NPX if exist "%ProgramFiles%\nodejs\npx.cmd" set "NPX=%ProgramFiles%\nodejs\npx.cmd"
if not defined NPX if exist "%ProgramFiles(x86)%\nodejs\npx.cmd" set "NPX=%ProgramFiles(x86)%\nodejs\npx.cmd"
if not defined NPX if exist "%APPDATA%\npm\npx.cmd" set "NPX=%APPDATA%\npm\npx.cmd"

if not defined NPX (
    echo [ERROR] Node.js / npx not found. Install Node.js from https://nodejs.org and run this script again.
    echo Or run in a terminal where "npx" works: npx --yes serve . -l 3000
    pause
    exit /b 1
)

echo Server will be available at: http://localhost:3000
echo Main page: http://localhost:3000/Page/index.html
echo Press Ctrl+C in the server window to stop.
echo.
start "Local Server" /min cmd /k "cd /d "%~dp0" && %NPX% --yes serve . -l 3000 --no-clipboard"
timeout /t 5 /nobreak >nul
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:3000/Page/index.html"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "http://localhost:3000/Page/index.html"
) else (
    start "" "http://localhost:3000/Page/index.html"
)
echo.
echo If the page does not open, go to: http://localhost:3000/Page/index.html
pause

