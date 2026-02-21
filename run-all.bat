@echo off
title Banking System - Full Stack
cd /d "%~dp0"

echo ========================================
echo   Banking Fraud Detection - Full Stack
echo ========================================
echo.

echo [1/6] Starting Ganache (Blockchain)...
start "Ganache" cmd /k "cd /d "%~dp0" && npx ganache-cli -p 8545 -d"
ping 127.0.0.1 -n 9

echo [2/6] Deploying Smart Contract...
node scripts/deploy-and-update.js
if errorlevel 1 (
  echo WARNING: Contract deploy failed. Backend will use fallback mode.
)

echo [3/6] Starting Backend...
start "Backend" cmd /k "cd /d "%~dp0Backend" && npm start"
ping 127.0.0.1 -n 6

echo [4/6] Starting ML Service (Flask)...
start "ML-Models" cmd /k "cd /d "%~dp0ML-Models" && python app.py"
ping 127.0.0.1 -n 5

echo [5/6] Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0Frontend" && npm run dev"

echo.
echo ========================================
echo   ALL SERVICES STARTED
echo ========================================
echo   Ganache:   http://localhost:8545
echo   Backend:   http://localhost:5000
echo   ML:       http://localhost:5001
echo   Frontend: http://localhost:5173
echo ========================================
echo   Open http://localhost:5173 in browser
echo ========================================
pause
