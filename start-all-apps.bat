@echo off
REM ============================================
REM BSG AI DEMOS - Startup Script
REM Starts all applications in the project
REM ============================================

echo.
echo ============================================
echo    BSG AI DEMOS - Starting All Apps
echo ============================================
echo.

REM Set the root directory
set ROOT_DIR=%~dp0

REM Check if node is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if python is installed
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Python is not installed or not in PATH
    echo Debitcards Backend will not start
)

echo.
echo [1/4] Starting Main App (Port 3000)...
echo ----------------------------------------
cd /d "%ROOT_DIR%"
if not exist "node_modules" (
    echo Installing dependencies for Main App...
    call npm install
)
start "Main App - Port 3000" cmd /k "cd /d %ROOT_DIR% && npm run dev -- --port 3000"

echo.
echo [2/4] Starting LMS Applicant Portal (Port 3001)...
echo ----------------------------------------
cd /d "%ROOT_DIR%lms-applicant-portal"
if not exist "node_modules" (
    echo Installing dependencies for LMS Portal...
    call npm install
)
start "LMS Portal - Port 3001" cmd /k "cd /d %ROOT_DIR%lms-applicant-portal && npm run dev -- --port 3001"

echo.
echo [3/4] Starting Debitcards Frontend (Port 3002)...
echo ----------------------------------------
cd /d "%ROOT_DIR%debitcards\frontend"
if not exist "node_modules" (
    echo Installing dependencies for Debitcards Frontend...
    call npm install
)
start "Debitcards Frontend - Port 3002" cmd /k "cd /d %ROOT_DIR%debitcards\frontend && npm run dev -- --port 3002"

echo.
echo [4/4] Starting Debitcards Backend (Port 8000)...
echo ----------------------------------------
cd /d "%ROOT_DIR%debitcards\backend"
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)
start "Debitcards Backend - Port 8000" cmd /k "cd /d %ROOT_DIR%debitcards\backend && venv\Scripts\activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000"

echo.
echo ============================================
echo    All Apps Starting!
echo ============================================
echo.
echo    Main App:            http://localhost:3000
echo    LMS Applicant Portal: http://localhost:3001
echo    Debitcards Frontend:  http://localhost:3002
echo    Debitcards Backend:   http://localhost:8000
echo.
echo ============================================
echo.
pause
