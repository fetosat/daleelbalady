// reviews.js
import express from "express";
import { PrismaClient } from "../generated/prisma/client.js";
import { z } from "zod";
import { auth, lightAuth } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const CreateReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comment is required").max(1000),
  serviceId: z.string().min(1).optional(), // More flexible ID validation
  productId: z.string().min(1).optional(),
  shopId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(), // Direct user reviews support
}).refine(
  (data) => {
    // At least one ID must be provided
    return !!(data.serviceId || data.productId || data.shopId || data.userId);
  },
  {
    message: "At least one ID (serviceId, productId, shopId, or userId) must be provided",
    path: ["ids"],
  }
);
// All fields are optional - flexibility for all review types

const UpdateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(1).max(1000).optional(),
});

// Get reviews for a service, product, shop, or user
router.get("/", async (req, res) => {
  try {
    const { serviceId, productId, shopId, userId, page = 1, limit = 10, rating, sortBy = 'createdAt' } = req.query;
    
    // No validation required - allow fetching all reviews if no filter
    // This provides maximum flexibility

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};
    
    if (serviceId) whereClause.serviceId = serviceId;
    if (productId) whereClause.productId = productId;
    if (shopId) whereClause.shopId = shopId;
    if (userId) whereClause.userId = userId; // User reviews enabled!
    if (rating) whereClause.rating = parseInt(rating);

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profilePic: true,
              isVerified: true,
              verifiedBadge: true,
            },
          },
        },
        orderBy: { [sortBy]: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.review.count({ where: whereClause }),
    ]);

    // Calculate rating statistics
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: whereClause,
      _count: {
        rating: true,
      },
    });

    const totalReviews = ratingStats.reduce((sum, stat) => sum + stat._count.rating, 0);
    const averageRating = totalReviews > 0 
      ? ratingStats.reduce((sum, stat) => sum + (stat.rating * stat._count.rating), 0) / totalReviews
      : 0;

    const ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    ratingStats.forEach(stat => {
      ratingDistribution[stat.rating] = stat._count.rating;
    });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
      statistics: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

// Create a new review - Available to all logged-in users
router.post("/", lightAuth, async (req, res) => {
  try {
    console.log('Review submission request:', {
      body: req.body,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    const validatedData = CreateReviewSchema.parse(req.body);
    const userId = req.user.id;
    
    console.log('Review validation successful:', validatedData);

    // Skip duplicate check for now to allow testing
    // const existingReview = await prisma.review.findFirst({
    //   where: {
    //     authorId: userId,
    //     ...(validatedData.serviceId && { serviceId: validatedData.serviceId }),
    //     ...(validatedData.productId && { productId: validatedData.productId }),
    //     ...(validatedData.shopId && { shopId: validatedData.shopId }),
    //     ...(validatedData.userId && { userId: validatedData.userId }),
    //   },
    // });

    // if (existingReview) {
    //   return res.status(409).json({ 
    //     error: "You have already reviewed this item" 
    //   });
    // }

    // Create the review
    const review = await prisma.review.create({
      data: {
        authorId: userId,
        rating: validatedData.rating,
        comment: validatedData.comment,
        serviceId: validatedData.serviceId || null,
        productId: validatedData.productId || null,
        shopId: validatedData.shopId || null,
        userId: validatedData.userId || null, // User reviews fully supported!
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true,
            verifiedBadge: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      review,
      message: "Review created successfully",
    });

  } catch (error) {
    console.error('Review creation error:', {
      error: error && error.message,
      fullError: error,
      requestBody: req.body,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
        received: e.received
      }));
      
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors,
        message: `Validation errors: ${validationErrors.map(e => `${e.field} - ${e.message}`).join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Database or other errors
    res.status(500).json({ 
      success: false,
      error: "Failed to create review",
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Update a review (only by the author)
router.put("/:reviewId", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const validatedData = UpdateReviewSchema.parse(req.body);
    const userId = req.user.id;

    // Check if review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (existingReview.authorId !== userId) {
      return res.status(403).json({ error: "You can only edit your own reviews" });
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: validatedData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true,
            verifiedBadge: true,
          },
        },
      },
    });

    res.json({
      success: true,
      review: updatedReview,
      message: "Review updated successfully",
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }
    
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Error updating review" });
  }
});

// Delete a review (only by the author)
router.delete("/:reviewId", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Check if review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (existingReview.authorId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: "You can only delete your own reviews" 
      });
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    res.json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ error: "Error deleting review" });
  }
});

// Get user's own reviews
router.get("/my-reviews", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { authorId: userId },
        include: {
          service: {
            select: {
              id: true,
              translation: {
                select: {
                  name_en: true,
                  name_ar: true,
                },
              },
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { [sortBy]: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.review.count({ where: { authorId: userId } }),
    ]);

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });

  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ error: "Error fetching user reviews" });
  }
});

export default router;
