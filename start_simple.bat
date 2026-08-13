@echo off
chcp 65001 >nul
cls
echo ========================================
echo   Lancement Simple - Backend + Frontend
echo ========================================
echo.

:: Libérer les ports
echo [1/3] Liberation des ports 8000 et 5173...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000 :5173"') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 >nul
echo [OK] Ports libere

:: Lancer le backend
echo [2/3] Lancement du backend...
start "Backend Server" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 2 >nul

:: Lancer le frontend
echo [3/3] Lancement du frontend...
start "Frontend Dev" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 1 >nul

echo.
echo ========================================
echo   Serveurs en cours de demarrage...
echo ========================================
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo.
echo [i] Les fenetres CMD restent ouvertes
echo [i] Pour arreter: fermez les fenetres ou Ctrl+C
