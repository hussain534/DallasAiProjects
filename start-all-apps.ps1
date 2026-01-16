# ============================================
# BSG AI DEMOS - Startup Script (PowerShell)
# Starts all applications in the project
# ============================================

$ErrorActionPreference = "Continue"
$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   BSG AI DEMOS - Starting All Apps" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# App configuration
$apps = @(
    @{
        Name = "Main App"
        Port = 3000
        Path = $RootDir
        Type = "node"
        Command = "npm run dev -- --port 3000"
    },
    @{
        Name = "LMS Applicant Portal"
        Port = 3001
        Path = Join-Path $RootDir "lms-applicant-portal"
        Type = "node"
        Command = "npm run dev -- --port 3001"
    },
    @{
        Name = "Debitcards Frontend"
        Port = 3002
        Path = Join-Path $RootDir "debitcards\frontend"
        Type = "node"
        Command = "npm run dev -- --port 3002"
    },
    @{
        Name = "Debitcards Backend"
        Port = 8000
        Path = Join-Path $RootDir "debitcards\backend"
        Type = "python"
        Command = "uvicorn app.main:app --reload --port 8000"
    }
)

# Function to kill process on port
function Stop-ProcessOnPort {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            Write-Host "  Stopping existing process on port $Port (PID: $pid)..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 1
    }
}

# Start each app
$index = 1
foreach ($app in $apps) {
    Write-Host ""
    Write-Host "[$index/4] Starting $($app.Name) (Port $($app.Port))..." -ForegroundColor Green
    Write-Host "----------------------------------------"

    # Kill any existing process on the port
    Stop-ProcessOnPort -Port $app.Port

    # Check if path exists
    if (-not (Test-Path $app.Path)) {
        Write-Host "  ERROR: Path not found: $($app.Path)" -ForegroundColor Red
        $index++
        continue
    }

    Push-Location $app.Path

    if ($app.Type -eq "node") {
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-Host "  Installing dependencies..." -ForegroundColor Yellow
            npm install 2>&1 | Out-Null
        }

        # Start the app
        Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title $($app.Name) - Port $($app.Port) && $($app.Command)" -WorkingDirectory $app.Path
    }
    elseif ($app.Type -eq "python") {
        # Create venv if needed
        $venvPath = Join-Path $app.Path "venv"
        if (-not (Test-Path $venvPath)) {
            Write-Host "  Creating Python virtual environment..." -ForegroundColor Yellow
            python -m venv venv 2>&1 | Out-Null
        }

        # Start the app
        $activateScript = Join-Path $venvPath "Scripts\activate.bat"
        Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title $($app.Name) - Port $($app.Port) && $activateScript && pip install -r requirements.txt && $($app.Command)" -WorkingDirectory $app.Path
    }

    Pop-Location
    Write-Host "  Started!" -ForegroundColor Green
    $index++
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   All Apps Started!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Main App:             " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host "   LMS Applicant Portal: " -NoNewline; Write-Host "http://localhost:3001" -ForegroundColor Yellow
Write-Host "   Debitcards Frontend:  " -NoNewline; Write-Host "http://localhost:3002" -ForegroundColor Yellow
Write-Host "   Debitcards Backend:   " -NoNewline; Write-Host "http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
