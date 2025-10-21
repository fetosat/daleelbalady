# 🛠️ Development Script for Daleelbalady Frontend  
# PowerShell script for Windows

Write-Host "🛠️ Starting Daleelbalady Frontend Development Server..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
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

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies first..." -ForegroundColor Blue
    switch ($packageManager) {
        "npm" { npm install }
        "yarn" { yarn install }
        "pnpm" { pnpm install }
        "bun" { bun install }
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
}

# Start development server
Write-Host "🌟 Starting development server..." -ForegroundColor Blue
Write-Host "🔥 Server will be available at: https://www.daleelbalady.com" -ForegroundColor Magenta
Write-Host "✨ With hot reload enabled for live changes!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow

switch ($packageManager) {
    "npm" { 
        npm run dev
    }
    "yarn" { 
        yarn dev
    }
    "pnpm" { 
        pnpm dev
    }
    "bun" { 
        bun dev
    }
}
