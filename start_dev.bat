@echo off
chcp 65001 >nul
cls
echo ========================================
echo   SaaS Gestion de Taches - Lancement
echo ========================================
echo.

:: Tuer les processus sur les ports 8000 et 5173
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000\|:5173"') do (
    echo [i] Liberation du port (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

:: Attendre 1 seconde
timeout /t 1 >nul

echo [->] Lancement du backend (port 8000)...
start "Backend" cmd /k "npm run dev"

:: Attendre 3 secondes pour que le backend demarre
timeout /t 3 >nul

echo [->] Lancement du frontend (port 5173)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Application en cours de demarrage...
echo ========================================
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo.
echo [i] Patientez quelques secondes...
echo [i] Appuyez sur Ctrl+C dans chaque fenetre pour arreter
