@echo off
chcp 65001 >nul
echo ========================================
echo Nettoyage et libération des ports
 ========================================
echo.

:: Libérer les ports 5173 (frontend) et 8000 (backend)
echo [1/2] Libération des ports 5173 et 8000...
for %%p in (5173 8000) do (
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING') do (
        taskkill /f /pid %%i >nul 2>&1
    )
)

:: Vider les caches
echo [2/2] Nettoyage des caches...
cd frontend
rmdir /s /q node_modules\.vite 2>nul
rmdir /s /q node_modules\.cache 2>nul
cd ..

echo.
echo Ports libérés et caches vidés.
echo ========================================
pause
