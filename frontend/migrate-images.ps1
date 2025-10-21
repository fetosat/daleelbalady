# PowerShell script to migrate <img> elements to Next.js <Image> components
Write-Host "🚀 Starting image migration..." -ForegroundColor Green

# Navigate to the correct directory
$frontendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $frontendDir

# Check if src directory exists
if (-not (Test-Path "src")) {
    Write-Host "❌ Error: src directory not found!" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Expected to find 'src' directory here" -ForegroundColor Yellow
    exit 1
}

# Run the migration script
try {
    Write-Host "📁 Processing directory: $(Get-Location)\src" -ForegroundColor Cyan
    & node migrate-images.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Image migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. npm run dev    # Start development server" -ForegroundColor White
        Write-Host "   2. Check that images load correctly" -ForegroundColor White
        Write-Host "   3. Test responsive behavior" -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 Benefits achieved:" -ForegroundColor Cyan
        Write-Host "   • Automatic image optimization" -ForegroundColor White
        Write-Host "   • Better Core Web Vitals (LCP)" -ForegroundColor White
        Write-Host "   • Reduced bandwidth usage" -ForegroundColor White
        Write-Host "   • Built-in lazy loading" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Migration failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Make sure you're in the frontend directory" -ForegroundColor White
    Write-Host "   2. Ensure Node.js is installed and accessible" -ForegroundColor White
    Write-Host "   3. Try running: node migrate-images.js" -ForegroundColor White
    exit 1
}
