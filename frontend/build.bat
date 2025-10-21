@echo off
REM 🚀 Build Script for Daleelbalady Frontend - CMD Version
echo.
echo 🚀 Starting Daleelbalady Frontend Build Process...
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set nodeVersion=%%i
echo ✅ Node.js found: %nodeVersion%

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

REM Install dependencies
echo 📦 Installing dependencies...
if "%packageManager%"=="npm" (
    npm install
) else if "%packageManager%"=="yarn" (
    yarn install
) else if "%packageManager%"=="pnpm" (
    pnpm install
) else if "%packageManager%"=="bun" (
    bun install
)

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!
echo.

REM Build the project
echo 🏗️ Building the project...
if "%packageManager%"=="npm" (
    npm run build
) else if "%packageManager%"=="yarn" (
    yarn build
) else if "%packageManager%"=="pnpm" (
    pnpm build
) else if "%packageManager%"=="bun" (
    bun run build
)

if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo 🎉 Build completed successfully!
echo ================================================
echo.
echo 🚀 To start the production server, run:
if "%packageManager%"=="npm" (
    echo    npm start
) else if "%packageManager%"=="yarn" (
    echo    yarn start
) else if "%packageManager%"=="pnpm" (
    echo    pnpm start
) else if "%packageManager%"=="bun" (
    echo    bun start
)
echo.
echo 🔥 Your Daleelbalady frontend is ready for production!
pause
