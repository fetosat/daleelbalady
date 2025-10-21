import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function debugReviewCreation() {
  try {
    console.log('=== Review Creation Debug Script ===');
    
    // Check if we have any users
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, name: true, email: true, role: true }
    });
    
    console.log('Available users:', users.length);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) [${user.role}] - ID: ${user.id}`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      return;
    }
    
    // Check if we have any shops/services/products to review
    const shops = await prisma.shop.findMany({ take: 3, select: { id: true, name: true } });
    const services = await prisma.service.findMany({ take: 3, select: { id: true, translation: true } });
    const products = await prisma.product.findMany({ take: 3, select: { id: true, name: true } });
    
    console.log('\nAvailable items to review:');
    console.log('Shops:', shops.length);
    shops.forEach(shop => console.log(`  - ${shop.name} (${shop.id})`));
    
    console.log('Services:', services.length);
    services.forEach(service => console.log(`  - ${service.translation?.name_en || service.translation?.name_ar || 'Unnamed'} (${service.id})`));
    
    console.log('Products:', products.length);
    products.forEach(product => console.log(`  - ${product.name} (${product.id})`));
    
    // Try to create a test review
    const testUser = users[0];
    let testTargetId = null;
    let testType = null;
    
    if (shops.length > 0) {
      testTargetId = shops[0].id;
      testType = 'shop';
    } else if (services.length > 0) {
      testTargetId = services[0].id;
      testType = 'service';
    } else if (products.length > 0) {
      testTargetId = products[0].id;
      testType = 'product';
    } else if (users.length > 1) {
      testTargetId = users[1].id;
      testType = 'user';
    }
    
    if (!testTargetId) {
      console.log('❌ No items available to review!');
      return;
    }
    
    console.log(`\n=== Attempting to create ${testType} review ===`);
    console.log('Author:', testUser.name, testUser.id);
    console.log('Target:', testType, testTargetId);
    
    const reviewData = {
      authorId: testUser.id,
      rating: 5,
      comment: 'Test review from debug script',
      [`${testType}Id`]: testTargetId
    };
    
    console.log('Review data:', reviewData);
    
    const review = await prisma.review.create({
      data: reviewData,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log('✅ Review created successfully!');
    console.log('Review ID:', review.id);
    console.log('Rating:', review.rating);
    console.log('Comment:', review.comment);
    console.log('Author:', review.author.name);
    console.log('Target type:', testType);
    console.log('Target ID:', testTargetId);
    
    // Clean up - delete the test review
    await prisma.review.delete({
      where: { id: review.id }
    });
    console.log('🧹 Test review cleaned up');
    
  } catch (error) {
    console.error('❌ Error in debug script:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack.split('\n').slice(0, 5).join('\n')
    });
  } finally {
    await prisma.$disconnect();
  }
}

debugReviewCreation();
