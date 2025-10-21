import { PrismaClient } from './generated/prisma/client.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function addTestData() {
  try {
    console.log('=== Adding Test Data for Reviews ===');
    
    // 1. Ensure we have a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'local@test.com' }
    });
    
    if (!testUser) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      testUser = await prisma.user.create({
        data: {
          id: "a801debc-9c62-4d0e-8a95-83a5577bd13e", // Match the token ID
          name: 'Local Test User',
          email: 'local@test.com',
          phone: '+20100000000',
          password: hashedPassword,
          role: 'CUSTOMER',
          isVerified: true,
          verifiedBadge: 'LOCAL_TEST'
        }
      });
      console.log('✅ Test user created:', testUser.name);
    } else {
      console.log('✅ Test user exists:', testUser.name);
    }
    
    // 2. Create a test shop if none exists
    let testShop = await prisma.shop.findFirst();
    if (!testShop) {
      console.log('Creating test shop...');
      testShop = await prisma.shop.create({
        data: {
          name: 'Test Shop للاختبار',
          description: 'A test shop for reviewing',
          city: 'Cairo',
          phone: '+20123456789',
          email: 'shop@test.com',
          ownerId: testUser.id,
          isVerified: true,
          slug: 'test-shop'
        }
      });
      console.log('✅ Test shop created:', testShop.name);
    } else {
      console.log('✅ Test shop exists:', testShop.name);
    }
    
    // 3. Create a test product if none exists
    let testProduct = await prisma.product.findFirst();
    if (!testProduct) {
      console.log('Creating test product...');
      testProduct = await prisma.product.create({
        data: {
          name: 'Test Product منتج للاختبار',
          description: 'A test product for reviewing',
          price: 100,
          stock: 50,
          currency: 'EGP',
          sku: 'TEST-PROD-001',
          isActive: true,
          shopId: testShop.id,
          listerId: testUser.id
        }
      });
      console.log('✅ Test product created:', testProduct.name);
    } else {
      console.log('✅ Test product exists:', testProduct.name);
    }
    
    // 4. Create a test service if none exists  
    let testService = await prisma.service.findFirst();
    if (!testService) {
      console.log('Creating test service...');
      
      // First create a translation
      const translation = await prisma.serviceTranslation.create({
        data: {
          name_en: 'Test Service',
          name_ar: 'خدمة للاختبار',
          description_en: 'A test service for reviewing',
          description_ar: 'خدمة تجريبية للمراجعة'
        }
      });
      
      testService = await prisma.service.create({
        data: {
          vid: 'SVC-TEST-001',
          translationId: translation.id,
          price: 200,
          currency: 'EGP',
          durationMins: 60,
          city: 'Cairo',
          available: true,
          ownerUserId: testUser.id,
          shopId: testShop.id
        }
      });
      console.log('✅ Test service created:', translation.name_en);
    } else {
      console.log('✅ Test service exists');
    }
    
    console.log('\n=== Test Data Summary ===');
    console.log('User ID:', testUser.id);
    console.log('Shop ID:', testShop.id);
    console.log('Product ID:', testProduct.id);
    console.log('Service ID:', testService.id);
    console.log('\n✅ All test data is ready for review testing!');
    
  } catch (error) {
    console.error('❌ Error adding test data:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

addTestData();
