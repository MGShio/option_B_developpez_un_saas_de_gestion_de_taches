@echo off
chcp 65001 >nul

:: Etape 1 : Nettoyage des ports avec PowerShell
powershell -ExecutionPolicy Bypass -File "%~dp0kill_ports.ps1"
echo.

:: Etape 2 : Lancer le backend
start "BACKEND" cmd /k "cd /d %~dp0 && npm run dev"

:: Etape 3 : Attendre et lancer le frontend
echo [i] Attente de 5 secondes pour le backend...
timeout /t 5 /nobreak >nul

cd /d %~dp0frontend
npm run dev
