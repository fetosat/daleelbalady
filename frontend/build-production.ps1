# Enhanced Production Build Script for Windows
# Daleel Balady - Next.js Build with Memory Optimizations

Write-Host "========================================" -ForegroundColor Blue
Write-Host "   Daleel Balady - Production Build    " -ForegroundColor Blue  
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Function to format bytes to human readable
function Format-Bytes {
    param([long]$bytes)
    if ($bytes -lt 1KB) { return "$bytes B" }
    elseif ($bytes -lt 1MB) { return "{0:N2} KB" -f ($bytes / 1KB) }
    elseif ($bytes -lt 1GB) { return "{0:N2} MB" -f ($bytes / 1MB) }
    else { return "{0:N2} GB" -f ($bytes / 1GB) }
}

# Step 1: Set Memory Optimizations
Write-Host "[1/7] Setting Node.js memory optimizations..." -ForegroundColor Cyan
$env:NODE_OPTIONS = "--max-old-space-size=4096 --max-semi-space-size=256 --optimize-for-size"
$env:NODE_ENV = "production"

Write-Host "✅ Memory settings applied:" -ForegroundColor Green
Write-Host "   NODE_OPTIONS: $env:NODE_OPTIONS" -ForegroundColor stone
Write-Host ""

# Step 2: Check System Resources  
Write-Host "[2/7] Checking system resources..." -ForegroundColor Cyan

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Check memory
try {
    $totalMemoryGB = [math]::Round((Get-CimInstance -ClassName Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
    $availableMemoryGB = [math]::Round((Get-CimInstance -ClassName Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)
    Write-Host "💾 System Memory: $availableMemoryGB GB available / $totalMemoryGB GB total" -ForegroundColor Green
    
    if ($availableMemoryGB -lt 2) {
        Write-Host "⚠️  Warning: Low memory detected. Build may fail." -ForegroundColor Yellow
    }
} catch {
    Write-Host "ℹ️  Could not determine memory usage" -ForegroundColor stone
}

Write-Host ""

# Step 3: Check Disk Space
Write-Host "[3/7] Checking disk space..." -ForegroundColor Cyan
try {
    $disk = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 -and $_.DeviceID -eq (Get-Location).Drive.Name }
    $freeSpaceGB = [math]::Round($disk.FreeSpace / 1GB, 2)
    $totalSpaceGB = [math]::Round($disk.Size / 1GB, 2)
    Write-Host "💽 Disk Space: $freeSpaceGB GB free / $totalSpaceGB GB total" -ForegroundColor Green
    
    if ($freeSpaceGB -lt 2) {
        Write-Host "⚠️  Warning: Low disk space detected." -ForegroundColor Yellow
    }
} catch {
    Write-Host "ℹ️  Could not determine disk space" -ForegroundColor stone
}

Write-Host ""

# Step 4: Comprehensive Cache Cleanup
Write-Host "[4/7] Comprehensive cache cleanup..." -ForegroundColor Cyan

$cacheLocations = @(".next", "node_modules\.cache", ".cache", "dist", "build")
foreach ($location in $cacheLocations) {
    if (Test-Path $location) {
        try {
            Remove-Item -Path $location -Recurse -Force -ErrorAction Stop
            Write-Host "✅ Removed: $location" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not remove: $location" -ForegroundColor Yellow
        }
    }
}

Write-Host "✅ Cache cleanup completed" -ForegroundColor Green
Write-Host ""

# Step 5: Check Package Manager and Install Dependencies
Write-Host "[5/7] Optimizing dependencies..." -ForegroundColor Cyan

$useYarn = $false
try {
    yarn --version | Out-Null
    $useYarn = $true
    Write-Host "✅ Using Yarn package manager" -ForegroundColor Green
} catch {
    Write-Host "✅ Using npm package manager" -ForegroundColor Green
}

try {
    if ($useYarn) {
        Write-Host "Installing dependencies with Yarn..." -ForegroundColor stone
        yarn install --frozen-lockfile --production=false
    } else {
        Write-Host "Installing dependencies with npm..." -ForegroundColor stone
        npm ci
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 6: Build with Memory Monitoring
Write-Host "[6/7] Starting Next.js build with optimizations..." -ForegroundColor Cyan
Write-Host "NODE_OPTIONS: $env:NODE_OPTIONS" -ForegroundColor stone
Write-Host "Starting build process..." -ForegroundColor stone

# Start memory monitoring job
$monitoringJob = Start-Job -ScriptBlock {
    while ($true) {
        try {
            $memInfo = Get-CimInstance -ClassName Win32_OperatingSystem
            $usedMemoryGB = [math]::Round(($memInfo.TotalVisibleMemorySize - $memInfo.FreePhysicalMemory) / 1MB, 2)
            $totalMemoryGB = [math]::Round($memInfo.TotalVisibleMemorySize / 1MB, 2)
            $percentUsed = [math]::Round(($usedMemoryGB / $totalMemoryGB) * 100, 1)
            Write-Host "Memory usage: $usedMemoryGB GB / $totalMemoryGB GB ($percentUsed%)" -ForegroundColor stone
        } catch {
            Write-Host "Memory monitoring error" -ForegroundColor Yellow
        }
        Start-Sleep 30
    }
}

# Run the build
$buildStartTime = Get-Date
try {
    if ($useYarn) {
        yarn build
    } else {
        npm run build
    }
    $buildSuccess = $true
} catch {
    $buildSuccess = $false
    $buildError = $_.Exception.Message
} finally {
    # Stop monitoring
    Stop-Job -Job $monitoringJob -ErrorAction SilentlyContinue
    Remove-Job -Job $monitoringJob -ErrorAction SilentlyContinue
}

$buildEndTime = Get-Date
$buildDuration = $buildEndTime - $buildStartTime

Write-Host ""

# Step 7: Results and Next Steps
if ($buildSuccess) {
    Write-Host "[7/7] ✅ Build completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Build artifacts created in .next directory" -ForegroundColor Green
    Write-Host "🚀 Ready for production deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Build statistics:" -ForegroundColor White
    Write-Host "⏱️  Build duration: $($buildDuration.TotalMinutes.ToString("F1")) minutes" -ForegroundColor stone
    
    # Check build size
    if (Test-Path ".next") {
        try {
            $buildSize = (Get-ChildItem -Path ".next" -Recurse -File | Measure-Object -Property Length -Sum).Sum
            Write-Host "📏 Build size: $(Format-Bytes $buildSize)" -ForegroundColor stone
        } catch {
            Write-Host "📏 Build size: Could not determine" -ForegroundColor stone
        }
    }
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Test locally: npm start" -ForegroundColor stone  
    Write-Host "2. Deploy to server: Upload .next folder" -ForegroundColor stone
    Write-Host "3. Monitor performance: Check server logs" -ForegroundColor stone

} else {
    Write-Host "[7/7] ❌ Build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting checklist:" -ForegroundColor Yellow
    Write-Host "1. Check memory usage (minimum 4GB recommended)" -ForegroundColor stone
    Write-Host "2. Close memory-intensive applications" -ForegroundColor stone  
    Write-Host "3. Verify Node.js version compatibility" -ForegroundColor stone
    Write-Host "4. Check for dependency conflicts" -ForegroundColor stone
    Write-Host ""
    Write-Host "🚑 Emergency solutions:" -ForegroundColor Yellow
    Write-Host "1. Build on a machine with more RAM" -ForegroundColor stone
    Write-Host "2. Use GitHub Actions or Docker for CI/CD" -ForegroundColor stone
    Write-Host "3. Contact system administrator for server optimization" -ForegroundColor stone
    
    if ($buildError) {
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Red
        Write-Host $buildError -ForegroundColor stone
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Build process completed                 " -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

# Pause to allow reading results
Read-Host "Press Enter to continue"
