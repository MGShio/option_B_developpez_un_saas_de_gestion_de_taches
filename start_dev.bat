@echo off
:: Start both backend and frontend development servers
:: Backend runs on port 8000, Frontend on port 3000

echo Starting development servers...

:: Start backend server in background
start "Backend" cmd /c "node dist/index.js"

:: Wait a bit for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend server in background
start "Frontend" cmd /c "cd frontend && npm run dev"

echo Both servers started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop servers.
