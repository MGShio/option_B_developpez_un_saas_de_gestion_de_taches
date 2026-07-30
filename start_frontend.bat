@echo off
chcp 65001 >nul
echo ========================================
echo Lancement du serveur Frontend (Vite)
echo ========================================

cd frontend

:: Libérer le port 5173 (port par défaut de Vite)
echo.
echo [1/3] Libération du port 5173...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /f /pid %%p >nul 2>&1
)

:: Vider le cache Vite
echo [2/3] Nettoyage du cache Vite...
rmdir /s /q node_modules\.vite 2>nul

:: Lancer le serveur Vite
echo [3/3] Démarrage du serveur Vite sur http://localhost:5173
echo ========================================
echo.
npm run dev
