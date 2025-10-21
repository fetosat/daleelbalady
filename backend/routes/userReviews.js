// userReviews.js - Temporary solution for user reviews until DB migration
import express from 'express';
import { auth } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

// In-memory storage (temporary until DB migration)
const userReviews = new Map();

// Validation schema
const UserReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000).optional(),
  targetUserId: z.string(),
});

// POST /api/user-reviews - Create a user review
router.post('/', auth, async (req, res) => {
  try {
    const validatedData = UserReviewSchema.parse(req.body);
    const authorId = req.user.id;
    
    // Create review object
    const review = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      authorId,
      author: {
        id: req.user.id,
        name: req.user.name,
        profilePic: req.user.profilePic,
        isVerified: req.user.isVerified,
      },
      targetUserId: validatedData.targetUserId,
      rating: validatedData.rating,
      comment: validatedData.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store in memory
    if (!userReviews.has(validatedData.targetUserId)) {
      userReviews.set(validatedData.targetUserId, []);
    }
    userReviews.get(validatedData.targetUserId).push(review);
    
    res.status(201).json({
      success: true,
      review,
      message: 'Review created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Error creating user review:', error);
    res.status(500).json({ error: 'Error creating review' });
  }
});

// GET /api/user-reviews/:userId - Get reviews for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = userReviews.get(userId) || [];
    
    res.json({
      success: true,
      reviews,
      statistics: {
        totalReviews: reviews.length,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

export default router;
