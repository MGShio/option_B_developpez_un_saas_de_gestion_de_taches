@echo off
:: Start both backend and frontend production servers
:: Backend runs on port 8000, Frontend on port 3000

echo Building and starting production servers...

:: Build backend
echo Building backend...
call npm run build
if errorlevel 1 (
    echo Backend build failed
    pause
    exit /b 1
)

:: Build frontend
echo Building frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo Frontend build failed
    pause
    exit /b 1
)
cd ..

:: Start backend server in background
start "Backend" cmd /c "node dist/index.js"

:: Wait a bit for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend server in background
start "Frontend" cmd /c "cd frontend && npm start"

echo Both servers started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop servers.
