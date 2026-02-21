@echo off
echo Starting Banking System...
echo.

start "Backend" cmd /k "cd /d "%~dp0Backend" && npm start"
ping 127.0.0.1 -n 6 >nul
start "Frontend" cmd /k "cd /d "%~dp0Frontend" && npm run dev"

echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Open http://localhost:5173 in your browser
pause
