import { PrismaClient } from './generated/prisma/client.js';
import { z } from 'zod';

const prisma = new PrismaClient();

// Same validation as in routes/reviews.js
const CreateReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comment is required").max(1000),
  serviceId: z.string().min(1).optional(),
  productId: z.string().min(1).optional(),
  shopId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
}).refine(
  (data) => {
    return !!(data.serviceId || data.productId || data.shopId || data.userId);
  },
  {
    message: "At least one ID (serviceId, productId, shopId, or userId) must be provided",
    path: ["ids"],
  }
);

async function testReview() {
  try {
    console.log('=== Simple Review Test ===');
    
    // Test validation first
    const testPayload = {
      rating: 5,
      comment: 'Test review',
      shopId: 'test-shop-id'
    };
    
    console.log('Testing validation...');
    try {
      const validatedData = CreateReviewSchema.parse(testPayload);
      console.log('✅ Validation passed:', validatedData);
    } catch (validationError) {
      console.log('❌ Validation failed:');
      console.log('Error:', validationError.message);
      console.log('Details:', validationError.errors);
      return;
    }
    
    // Get a real user from database
    const user = await prisma.user.findFirst({
      select: { id: true, name: true, email: true }
    });
    
    if (!user) {
      console.log('❌ No user found in database!');
      return;
    }
    
    console.log('Found user:', user.name, user.id);
    
    // Try creating a review for the user themselves (user review)
    console.log('Testing user review creation...');
    
    const reviewData = {
      rating: 5,
      comment: 'Test review from simple script',
      userId: user.id  // Review the user themselves
    };
    
    console.log('Validating review data:', reviewData);
    const validatedData = CreateReviewSchema.parse(reviewData);
    console.log('✅ Validation successful');
    
    // Create the review
    console.log('Creating review in database...');
    const review = await prisma.review.create({
      data: {
        authorId: user.id,
        rating: validatedData.rating,
        comment: validatedData.comment,
        serviceId: validatedData.serviceId || null,
        productId: validatedData.productId || null,
        shopId: validatedData.shopId || null,
        userId: validatedData.userId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('✅ Review created successfully!');
    console.log('Review ID:', review.id);
    console.log('Author:', review.author.name);
    console.log('Rating:', review.rating);
    console.log('Comment:', review.comment);
    console.log('Target User ID:', review.userId);
    
    // Clean up
    await prisma.review.delete({
      where: { id: review.id }
    });
    console.log('🧹 Test review cleaned up');
    
    console.log('\n✅ Review system is working correctly!');
    console.log('The 500 error might be from missing target entities or other issues.');
    
  } catch (error) {
    console.error('❌ Error in simple review test:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      cause: error.cause
    });
    
    if (error.stack) {
      console.error('Stack trace:', error.stack.split('\n').slice(0, 10).join('\n'));
    }
  } finally {
    await prisma.$disconnect();
  }
}

testReview();
