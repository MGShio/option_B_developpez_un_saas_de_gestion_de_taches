@echo off
chcp 65001 > nul

echo [1/3] Clearing npm cache...
npm cache clean --force

echo [2/3] Freeing port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /PID %%a /F > nul 2>&1
)

echo [3/3] Killing all node processes...
taskkill /IM node.exe /F > nul 2>&1

echo Done. Ports and cache cleared.
pause
