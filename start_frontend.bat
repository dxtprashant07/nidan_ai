@echo off
echo Starting NIDAN AI Frontend...
cd /d "%~dp0frontend"
call npm install
call npm run dev
pause
