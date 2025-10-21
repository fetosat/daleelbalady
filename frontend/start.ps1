# 🚀 Start Script for Daleelbalady Frontend
# PowerShell script for Windows

Write-Host "🚀 Starting Daleelbalady Frontend Production Server..." -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Yellow

# Check if build exists
if (-not (Test-Path ".next")) {
    Write-Host "❌ Build not found. Running build first..." -ForegroundColor Yellow
    .\build.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed. Cannot start server." -ForegroundColor Red
        exit 1
    }
}

# Check which package manager is available
$packageManager = $null

if (Get-Command "npm" -ErrorAction SilentlyContinue) {
    $packageManager = "npm"
} elseif (Get-Command "yarn" -ErrorAction SilentlyContinue) {
    $packageManager = "yarn"  
} elseif (Get-Command "pnpm" -ErrorAction SilentlyContinue) {
    $packageManager = "pnpm"
} elseif (Get-Command "bun" -ErrorAction SilentlyContinue) {
    $packageManager = "bun"
} else {
    Write-Host "❌ No package manager found. Please install npm, yarn, pnpm, or bun." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Using package manager: $packageManager" -ForegroundColor Green

# Start the production server
Write-Host "🌟 Starting production server on https://www.daleelbalady.com" -ForegroundColor Blue
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Yellow

switch ($packageManager) {
    "npm" { 
        npm start
    }
    "yarn" { 
        yarn start
    }
    "pnpm" { 
        pnpm start
    }
    "bun" { 
        bun start
    }
}
