import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🔍 Checking current subscription for user fetyany...');
        const existing = await prisma.providerSubscription.findFirst({
            where: {
                providerId: 'fd352bf9-2d0a-496f-b434-43e4c0e133c9'
            }
        });
        
        if (existing) {
            console.log('⚠️  Subscription already exists:', existing.planType);
            console.log('📅 Expires at:', existing.expiresAt);
            console.log('✅ Can list products:', existing.canListProducts);
            console.log('🔄 Active:', existing.isActive);
            
            // Update if needed
            if (!existing.canListProducts || !existing.isActive) {
                console.log('🔄 Updating subscription to enable product listing...');
                const updated = await prisma.providerSubscription.update({
                    where: { id: existing.id },
                    data: {
                        canListProducts: true,
                        isActive: true,
                        planType: 'PRODUCTS_PREMIUM',
                        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
                    }
                });
                console.log('✅ Subscription updated!');
                console.log('📋 New details:', updated);
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
        
        console.log('');
        console.log('✅ Done! Please:');
        console.log('   1. Restart your backend server');
        console.log('   2. Refresh the frontend page');
        console.log('   3. You should now be able to add products!');
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

