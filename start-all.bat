@echo off
echo ========================================
echo   E-Commerce Application Launcher
echo ========================================
echo.

echo [1/2] Starting Backend Server on Port 5000...
start "E-Commerce Backend" cmd /k "cd /d "%~dp0" && node db/admin_server.js"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend on Port 3000...
start "E-Commerce Frontend" cmd /k "cd /d "%~dp0" && npm start"

echo.
echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend App:   http://localhost:3000
echo Admin Panel:    http://localhost:3000/admin
echo.
echo Press any key to close this window...
pause > nul
