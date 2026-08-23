@echo off
taskkill /f /im node.exe > nul 2>&1
timeout /t 3 > nul
start "BACKEND" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 5 /nobreak > nul
cd /d %~dp0frontend
npm run dev
