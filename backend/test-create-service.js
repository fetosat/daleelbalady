import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function testServiceCreation() {
    try {
        console.log('Testing service creation...');
        
        // Test 1: Check if we can create a translation
        console.log('1. Creating translation...');
        const translation = await prisma.service_translation.create({
            data: {
                name_en: 'Test Service',
                name_ar: 'خدمة تجريبية',
                description_en: 'Test description',
                description_ar: 'وصف تجريبي'
            }
        });
        console.log('Translation created:', translation.id);

        // Test 2: Check if we have any shops for userId 1
        console.log('2. Checking for existing shops...');
        const shops = await prisma.shop.findMany({
            where: {
                ownerId: '1',
                deletedAt: null
            }
        });
        console.log('Found shops:', shops.length);
        
        let shopId;
        if (shops.length > 0) {
            shopId = shops[0].id;
            console.log('Using existing shop:', shopId);
        } else {
            console.log('3. Creating a test shop...');
            const shop = await prisma.shop.create({
                data: {
                    name: 'Test Shop',
                    slug: `test-shop-${Date.now()}`,
                    ownerId: '1',
                    city: 'Cairo'
                }
            });
            shopId = shop.id;
            console.log('Shop created:', shopId);
        }

        // Test 3: Try to create a service
        console.log('4. Creating service...');
        const service = await prisma.service.create({
            data: {
                price: 10.0,
                durationMins: 60,
                currency: 'EGP',
                available: true,
                shop: {
                    connect: { id: shopId }
                },
                embeddingText: 'Test Service',
                ownerUserId: '1',
                translationId: translation.id
            },
            include: {
                translation: true,
                shop: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                }
            }
        });
        
        console.log('Service created successfully:', service.id);
        console.log('Service details:', {
            id: service.id,
            price: service.price,
            duration: service.durationMins,
            shopId: service.shopId,
            translationId: service.translationId
        });

        // Test 4: Try to update with images
        console.log('5. Testing image update...');
        const updatedService = await prisma.service.update({
            where: { id: service.id },
            data: {
                coverImage: '/uploads/services/test-image.jpg',
                galleryImages: JSON.stringify(['/uploads/services/test-image.jpg'])
            }
        });
        console.log('Image update successful');

    } catch (error) {
        console.error('Test failed:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
    } finally {
        await prisma.$disconnect();
    }
}

testServiceCreation();
