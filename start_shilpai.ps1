
# ShilpAI - One-Click Launcher for Windows PowerShell

Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host " SHILPAI - AI-Driven Market Linkage and Smart Cataloging" -ForegroundColor Yellow
Write-Host " From Craft to Commerce - AI Business Manager" -ForegroundColor Yellow
Write-Host "==============================================================" -ForegroundColor Cyan

$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

Write-Host "`nStarting ShilpAI Full-Stack Server on http://localhost:8000..." -ForegroundColor Green
Write-Host "Open http://localhost:8000 in your browser." -ForegroundColor Cyan
Write-Host "API Documentation: http://localhost:8000/api/v1/docs" -ForegroundColor Gray
Write-Host "`nPress Ctrl+C to stop the server.`n" -ForegroundColor DarkGray

python -m uvicorn app.main:app --app-dir ./backend --host 127.0.0.1 --port 8000 --reload
