@echo off
cd /d "%~dp0"
echo Starting alliance daily report (local proxy)...
node serve-daily-report.mjs
if errorlevel 1 (
  echo.
  echo Node.js is required. Install from https://nodejs.org then retry.
  pause
)
