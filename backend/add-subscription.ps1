# PowerShell script to add test subscription
# Run this from the backend directory

Write-Host "🔧 Adding test subscription for user 'fetyany'..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please make sure you're in the backend directory." -ForegroundColor Red
    exit 1
}

# Load DATABASE_URL from .env
$envContent = Get-Content ".env" | Where-Object { $_ -match "^DATABASE_URL=" }
if ($envContent) {
    $databaseUrl = ($envContent -split "=", 2)[1].Trim('"')
    Write-Host "✅ Found DATABASE_URL" -ForegroundColor Green
} else {
    Write-Host "❌ DATABASE_URL not found in .env file" -ForegroundColor Red
    exit 1
}

# Run the SQL script using Prisma
Write-Host "📝 Executing SQL script..." -ForegroundColor Yellow

# Read SQL content
$sqlContent = Get-Content "add-test-subscription.sql" -Raw

# Create temporary JS file to execute SQL
$jsContent = @"
import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔍 Checking current subscription...');
        const existing = await prisma.providerSubscription.findFirst({
            where: {
                providerId: 'fd352bf9-2d0a-496f-b434-43e4c0e133c9'
            }
        });
        
        if (existing) {
            console.log('⚠️  Subscription already exists:', existing.planType);
            console.log('📅 Expires at:', existing.expiresAt);
            console.log('✅ Can list products:', existing.canListProducts);
            
            // Update if needed
            if (!existing.canListProducts || !existing.isActive) {
                console.log('🔄 Updating subscription to enable product listing...');
                await prisma.providerSubscription.update({
                    where: { id: existing.id },
                    data: {
                        canListProducts: true,
                        isActive: true,
                        planType: 'PRODUCTS_PREMIUM',
                        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
                    }
                });
                console.log('✅ Subscription updated!');
            } else {
                console.log('✅ Subscription is already active with product listing enabled!');
            }
        } else {
            console.log('➕ Creating new subscription...');
            const subscription = await prisma.providerSubscription.create({
                data: {
                    providerId: 'fd352bf9-2d0a-496f-b434-43e4c0e133c9',
                    planType: 'PRODUCTS_PREMIUM',
                    pricePerYear: 999.00,
                    canTakeBookings: true,
                    canListProducts: true,
                    searchPriority: 5,
                    isActive: true,
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
                }
            });
            console.log('✅ Subscription created successfully!');
            console.log('📋 Details:', subscription);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.\`$disconnect\`();
    }
}

main();
"@

# Write temporary JS file
$jsContent | Out-File -FilePath "temp-add-subscription.js" -Encoding UTF8

# Run the script
Write-Host "🚀 Running subscription script..." -ForegroundColor Green
node temp-add-subscription.js

# Clean up
Remove-Item "temp-add-subscription.js" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Done! Please restart your backend server and refresh the frontend." -ForegroundColor Green
Write-Host "   The user should now be able to add products." -ForegroundColor Green

