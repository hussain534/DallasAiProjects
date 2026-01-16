@echo off
REM ============================================
REM BSG AI DEMOS - Stop All Apps Script
REM Stops all running applications
REM ============================================

echo.
echo ============================================
echo    BSG AI DEMOS - Stopping All Apps
echo ============================================
echo.

echo Stopping processes on port 3000 (Main App)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

echo Stopping processes on port 3001 (LMS Portal)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

echo Stopping processes on port 3002 (Debitcards Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

echo Stopping processes on port 8000 (Debitcards Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo ============================================
echo    All Apps Stopped!
echo ============================================
echo.
pause
