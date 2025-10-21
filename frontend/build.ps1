# 🚀 Build Script for Daleelbalady Frontend
# PowerShell script for Windows

Write-Host "🚀 Starting Daleelbalady Frontend Build Process..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Yellow

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

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
switch ($packageManager) {
    "npm" { 
        npm install
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
            exit 1
        }
    }
    "yarn" { 
        yarn install 
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
            exit 1
        }
    }
    "pnpm" { 
        pnpm install 
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
            exit 1
        }
    }
    "bun" { 
        bun install 
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Build the project
Write-Host "🏗️ Building the project..." -ForegroundColor Blue
switch ($packageManager) {
    "npm" { 
        npm run build
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "❌ Build failed" -ForegroundColor Red
            exit 1
        }
    }
    "yarn" { 
        yarn build 
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "❌ Build failed" -ForegroundColor Red
            exit 1
        }
    }
    "pnpm" { 
        pnpm build 
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "❌ Build failed" -ForegroundColor Red
            exit 1
        }
    }
    "bun" { 
        bun run build 
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "❌ Build failed" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow

Write-Host "🚀 To start the production server, run:" -ForegroundColor Cyan
switch ($packageManager) {
    "npm" { Write-Host "   npm start" -ForegroundColor White }
    "yarn" { Write-Host "   yarn start" -ForegroundColor White }
    "pnpm" { Write-Host "   pnpm start" -ForegroundColor White }
    "bun" { Write-Host "   bun start" -ForegroundColor White }
}

Write-Host "🔥 Your Daleelbalady frontend is ready for production!" -ForegroundColor Magenta
