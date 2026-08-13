@echo off
chcp 65001 >nul
cls
echo ========================================
echo   Arret des serveurs SaaS Gestion de Taches
echo ========================================
echo.

:: Trouver et tuer les processus Node.js
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000\|:5173"') do (
    echo [i] Trouve processus sur port (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo [!] Impossible de terminer le processus %%a
    ) else (
        echo [OK] Processus %%a termine
    )
)

:: Alternative: tuer tous les processus node
echo.
echo [->] Recherche de tous les processus Node.js...
tasklist /FI "IMAGENAME eq node.exe" /FO CSV | findstr /i node >nul
if errorlevel 1 (
    echo [i] Aucun processus Node.js trouve
) else (
    for /f "tokens=2 delims=," %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH') do (
        for /f "tokens=2 delims= " %%b in ("%%a") do (
            taskkill /F /PID %%b >nul 2>&1
            if errorlevel 1 (
                echo [!] Impossible de terminer le processus %%b
            ) else (
                echo [OK] Processus Node.js %%b termine
            )
        )
    )
)

echo.
echo ========================================
echo   Serveurs arretes!
echo ========================================
echo.
pause
