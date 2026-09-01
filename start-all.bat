@echo off
echo.
echo  =======================================
echo   RevenueRescue AI - Start All Services
echo  =======================================
echo.

echo [1/3] Starting ML Service (port 8000)...
start "ML Service" cmd /k "cd /d %~dp0ml-service && python main.py"

timeout /t 3 > nul

echo [2/3] Starting Backend API (port 5000)...
start "Backend API" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 > nul

echo [3/3] Starting Frontend (port 3000)...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo  All services starting...
echo  Frontend:   http://localhost:3000
echo  Backend:    http://localhost:5000
echo  ML Service: http://localhost:8000
echo.
