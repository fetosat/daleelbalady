#!/bin/bash

# Install Missing Dependencies Script
# سكريبت تثبيت التبعيات المفقودة

echo "🔧 Installing missing backend dependencies..."

# Install missing packages
npm install speakeasy qrcode

echo "✅ Missing dependencies installed successfully!"

# Display installed versions
echo "📦 Installed packages:"
npm list speakeasy qrcode --depth=0

echo "🚀 Backend is ready to restart!"
echo "Run: pm2 restart server"
