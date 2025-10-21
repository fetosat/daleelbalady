@echo off
REM 🚀 Start Script for Daleelbalady Frontend - CMD Version
echo.
echo 🚀 Starting Daleelbalady Frontend Production Server...
echo ======================================================
echo.

REM Check if build exists
if not exist ".next" (
    echo ❌ Build not found. Running build first...
    call build.bat
    if %errorlevel% neq 0 (
        echo ❌ Build failed. Cannot start server.
        pause
        exit /b 1
    )
)

REM Check which package manager is available
set packageManager=

where npm >nul 2>&1
if %errorlevel% equ 0 (
    set packageManager=npm
    goto :found
)

where yarn >nul 2>&1
if %errorlevel% equ 0 (
    set packageManager=yarn
    goto :found
)

where pnpm >nul 2>&1
if %errorlevel% equ 0 (
    set packageManager=pnpm
    goto :found
)

where bun >nul 2>&1
if %errorlevel% equ 0 (
    set packageManager=bun
    goto :found
)

echo ❌ No package manager found. Please install npm, yarn, pnpm, or bun.
pause
exit /b 1

:found
echo ✅ Using package manager: %packageManager%
echo.

REM Start the production server
echo 🌟 Starting production server on https://www.daleelbalady.com
echo Press Ctrl+C to stop the server
echo ======================================================
echo.

if "%packageManager%"=="npm" (
    npm start
) else if "%packageManager%"=="yarn" (
    yarn start
) else if "%packageManager%"=="pnpm" (
    pnpm start
) else if "%packageManager%"=="bun" (
    bun start
)
