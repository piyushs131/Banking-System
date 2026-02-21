# Banking System - Full Stack Launcher
# Runs: Ganache, Backend, ML Service, Frontend

$root = $PSScriptRoot
Set-Location $root

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Banking Fraud Detection - Full Stack" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Start Ganache
Write-Host "[1/5] Starting Ganache (Blockchain)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npx ganache-cli -p 8545 -d"
Start-Sleep -Seconds 8

# 2. Deploy Contract
Write-Host "[2/5] Deploying Smart Contract..." -ForegroundColor Yellow
try {
    node scripts/deploy-and-update.js
} catch {
    Write-Host "  Contract deploy failed - using fallback mode" -ForegroundColor DarkYellow
}

# 3. Backend
Write-Host "[3/5] Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\Backend'; npm start"
Start-Sleep -Seconds 5

# 4. ML Service
Write-Host "[4/5] Starting ML Service (Flask)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ML-Models'; python app.py"
Start-Sleep -Seconds 4

# 5. Frontend
Write-Host "[5/5] Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\Frontend'; npm run dev"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ALL SERVICES STARTED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Ganache:   http://localhost:8545" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "  ML:        http://localhost:5001" -ForegroundColor White
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nOpen http://localhost:5173 in your browser`n" -ForegroundColor Yellow
