#!/bin/bash

# Enhanced Production build script with comprehensive memory optimization
# This script helps prevent SIGKILL errors during Next.js builds

set -e # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "   Daleel Balady - Production Build"
echo "========================================"

echo ""
echo -e "${BLUE}[1/7] Setting Node.js memory optimizations...${NC}"
# Increased memory limits and additional optimizations
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=256 --optimize-for-size"
export NODE_ENV=production

echo -e "${BLUE}[2/7] Checking system resources...${NC}"
echo "Node.js version: $(node --version)"
echo "Package manager: $(command -v yarn >/dev/null 2>&1 && echo 'yarn' || echo 'npm')"
echo "Available memory:"
free -h 2>/dev/null || echo "Memory info not available"

echo ""
echo -e "${BLUE}[3/7] Checking disk space...${NC}"
df -h . 2>/dev/null || echo "Disk info not available"

echo ""
echo -e "${BLUE}[4/7] Comprehensive cache cleanup...${NC}"
rm -rf .next
rm -rf node_modules/.cache
rm -rf .cache
rm -rf dist
rm -rf build
echo "✅ All caches cleaned"

echo ""
echo -e "${BLUE}[5/7] Optimizing dependencies...${NC}"
if command -v yarn >/dev/null 2>&1; then
    echo "Using Yarn for optimized dependency management..."
    yarn install --frozen-lockfile --production=false
else
    echo "Using npm for dependency management..."
    npm ci
fi

echo ""
echo -e "${BLUE}[6/7] Starting Next.js build with full optimizations...${NC}"
echo "NODE_OPTIONS: $NODE_OPTIONS"
echo "Starting build process..."

# Monitor memory usage during build
(while sleep 30; do
    echo "Memory usage: $(free -m 2>/dev/null | awk 'NR==2{printf "%.1fGB used / %.1fGB total (%.1f%%)\n", $3/1024,$2/1024,$3*100/$2}' || echo 'N/A')"
done) &
MONITOR_PID=$!

# Run the actual build
if command -v yarn >/dev/null 2>&1; then
    timeout 1800 yarn build  # 30 minute timeout
else
    timeout 1800 npm run build  # 30 minute timeout
fi

BUILD_EXIT_CODE=$?

# Stop memory monitoring
kill $MONITOR_PID 2>/dev/null || true

echo ""
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}[7/7] ✅ Build completed successfully!${NC}"
    echo ""
    echo "📦 Build artifacts created in .next directory"
    echo "🚀 Ready for production deployment!"
    echo ""
    echo "Build statistics:"
    du -sh .next 2>/dev/null || echo "Could not determine build size"
    echo ""
    echo "Next steps:"
    echo "1. Test locally: npm start"
    echo "2. Deploy to server: pm2 restart frontend"
    echo "3. Monitor performance: pm2 logs frontend"
elif [ $BUILD_EXIT_CODE -eq 124 ]; then
    echo -e "${RED}[7/7] ❌ Build timed out (30 minutes limit)${NC}"
    echo ""
    echo -e "${YELLOW}⚠️ Build took too long. Consider:${NC}"
    echo "1. Building locally and uploading .next folder"
    echo "2. Using a more powerful server or CI/CD"
    echo "3. Optimizing bundle size with analyzer"
else
    echo -e "${RED}[7/7] ❌ Build failed with exit code: $BUILD_EXIT_CODE${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting checklist:${NC}"
    echo "1. Memory: $(free -m 2>/dev/null | awk 'NR==2{print $3"MB used / "$2"MB total"}' || echo 'Check available RAM')"
    echo "2. Disk space: $(df -h . | awk 'NR==2{print $4" available"}')"
    echo "3. Node.js version compatibility"
    echo "4. Dependencies conflicts"
    echo ""
    echo -e "${YELLOW}🚑 Emergency solutions:${NC}"
    echo "1. Add swap: sudo fallocate -l 4G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
    echo "2. Build locally: npm run build && scp -r .next user@server:/path/"
    echo "3. Use GitHub Actions or Docker for CI/CD"
    exit $BUILD_EXIT_CODE
fi

echo ""
echo "========================================"
echo "Build process completed successfully"
echo "========================================"

