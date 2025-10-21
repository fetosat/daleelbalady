@echo off
echo ========================================
echo    Daleel Balady - Production Build
echo ========================================

echo.
echo [1/6] Setting Node.js memory limit to 4GB...
set NODE_OPTIONS=--max-old-space-size=4096 --max-semi-space-size=256

echo [2/6] Checking Node.js and npm versions...
node --version
npm --version

echo.
echo [3/6] Cleaning build cache and artifacts...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .cache rmdir /s /q .cache

echo.
echo [4/6] Checking memory available...
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:list | findstr /r /c:"="

echo.
echo [5/6] Starting Next.js build with memory optimizations...
echo NODE_OPTIONS: %NODE_OPTIONS%
npm run build

echo.
if %ERRORLEVEL% EQU 0 (
    echo [6/6] ✅ Build completed successfully!
    echo.
    echo Build artifacts created in .next folder
    echo You can now deploy to your server
    echo.
    echo To start production server locally:
    echo npm start
) else (
    echo [6/6] ❌ Build failed with error code: %ERRORLEVEL%
    echo.
    echo Troubleshooting suggestions:
    echo 1. Check if you have enough RAM ^(minimum 4GB recommended^)
    echo 2. Close other memory-intensive applications
    echo 3. Try building with yarn instead: yarn build
    echo 4. Check logs above for specific errors
    echo.
    echo For server deployment, consider:
    echo 1. Adding swap space ^(4GB recommended^)
    echo 2. Building locally and uploading .next folder
    echo 3. Using CI/CD pipeline like GitHub Actions
)

echo.
echo ========================================
echo Build process completed
echo ========================================
pause
