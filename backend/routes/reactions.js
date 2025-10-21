import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/reactions - Add or update reaction to review
router.post('/', async (req, res) => {
  try {
    const { userId, reviewId, type } = req.body;

    if (!userId || !reviewId || !type) {
      return res.status(400).json({
        success: false,
        message: 'User ID, review ID, and reaction type are required'
      });
    }

    if (!['LIKE', 'DISLIKE', 'HELPFUL', 'NOT_HELPFUL'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type. Must be LIKE, DISLIKE, HELPFUL, or NOT_HELPFUL'
      });
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Prevent users from reacting to their own reviews
    if (review.authorId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot react to your own review'
      });
    }

    // Check if user already has a reaction to this review
    const existingReaction = await prisma.reviewReaction.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId
        }
      }
    });

    let reaction;
    let message;

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Same reaction type - remove it (toggle off)
        await prisma.reviewReaction.delete({
          where: { id: existingReaction.id }
        });
        
        message = 'Reaction removed';
        reaction = null;
      } else {
        // Different reaction type - update it
        reaction = await prisma.reviewReaction.update({
          where: { id: existingReaction.id },
          data: { type }
        });
        
        message = 'Reaction updated';
      }
    } else {
      // No existing reaction - create new one
      reaction = await prisma.reviewReaction.create({
        data: {
          userId,
          reviewId,
          type
        }
      });
      
      message = 'Reaction added';
    }

    // Track reaction in analytics
    try {
      await fetch(`${process.env.BASE_URL}/api/analytics/track-reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          reviewAuthorId: review.authorId
        })
      });
    } catch (analyticsError) {
      console.warn('Failed to track reaction analytics:', analyticsError);
    }

    // Get updated reaction counts for the review
    const reactionCounts = await getReactionCounts(reviewId);

    res.json({
      success: true,
      reaction,
      reactionCounts,
      message
    });

  } catch (error) {
    console.error('Error handling reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/reactions/review/:reviewId - Get all reactions for a review
router.get('/review/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.query; // Optional: to check user's reaction

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Get reaction counts
    const reactionCounts = await getReactionCounts(reviewId);

    // Get user's reaction if userId is provided
    let userReaction = null;
    if (userId) {
      userReaction = await prisma.reviewReaction.findUnique({
        where: {
          userId_reviewId: {
            userId,
            reviewId
          }
        },
        select: {
          type: true,
          createdAt: true
        }
      });
    }

    // Get recent reactions with user details
    const recentReactions = await prisma.reviewReaction.findMany({
      where: { reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Latest 10 reactions
    });

    res.json({
      success: true,
      reactionCounts,
      userReaction,
      recentReactions
    });

  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/reactions/user/:userId - Get user's reactions
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    let whereClause = { userId };
    
    // Filter by reaction type if provided
    if (type && ['LIKE', 'DISLIKE', 'HELPFUL', 'NOT_HELPFUL'].includes(type)) {
      whereClause.type = type;
    }

    const reactions = await prisma.reviewReaction.findMany({
      where: whereClause,
      include: {
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                profilePic: true
              }
            },
            service: {
              select: {
                id: true,
                vid: true,
                translation: {
                  select: {
                    name_en: true,
                    name_ar: true
                  }
                }
              }
            },
            shop: {
              select: {
                id: true,
                vid: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    const totalReactions = await prisma.reviewReaction.count({
      where: whereClause
    });

    // Get reaction type counts for this user
    const reactionTypeCounts = await prisma.reviewReaction.groupBy({
      by: ['type'],
      where: { userId },
      _count: {
        type: true
      }
    });

    res.json({
      success: true,
      reactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalReactions,
        pages: Math.ceil(totalReactions / parseInt(limit))
      },
      reactionTypeCounts: reactionTypeCounts.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {
        LIKE: 0,
        DISLIKE: 0,
        HELPFUL: 0,
        NOT_HELPFUL: 0
      })
    });

  } catch (error) {
    console.error('Error fetching user reactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/reactions - Remove reaction from review
router.delete('/', async (req, res) => {
  try {
    const { userId, reviewId } = req.body;

    if (!userId || !reviewId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and review ID are required'
      });
    }

    // Check if reaction exists
    const existingReaction = await prisma.reviewReaction.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId
        }
      }
    });

    if (!existingReaction) {
      return res.status(404).json({
        success: false,
        message: 'Reaction not found'
      });
    }

    // Remove reaction
    await prisma.reviewReaction.delete({
      where: { id: existingReaction.id }
    });

    // Get updated reaction counts for the review
    const reactionCounts = await getReactionCounts(reviewId);

    res.json({
      success: true,
      reactionCounts,
      message: 'Reaction removed successfully'
    });

  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/reactions/stats/:reviewId - Get detailed reaction statistics
router.get('/stats/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, rating: true, createdAt: true }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Get detailed reaction statistics
    const reactionStats = await prisma.reviewReaction.groupBy({
      by: ['type'],
      where: { reviewId },
      _count: {
        type: true
      }
    });

    // Get total reactions
    const totalReactions = await prisma.reviewReaction.count({
      where: { reviewId }
    });

    // Calculate percentages and organize data
    const stats = {
      total: totalReactions,
      breakdown: {
        LIKE: 0,
        DISLIKE: 0,
        HELPFUL: 0,
        NOT_HELPFUL: 0
      },
      percentages: {
        LIKE: 0,
        DISLIKE: 0,
        HELPFUL: 0,
        NOT_HELPFUL: 0
      }
    };

    reactionStats.forEach(stat => {
      stats.breakdown[stat.type] = stat._count.type;
      stats.percentages[stat.type] = totalReactions > 0 
        ? Math.round((stat._count.type / totalReactions) * 100)
        : 0;
    });

    // Calculate helpfulness score (helpful vs not helpful)
    const helpfulReactions = stats.breakdown.HELPFUL + stats.breakdown.NOT_HELPFUL;
    const helpfulnessScore = helpfulReactions > 0 
      ? Math.round((stats.breakdown.HELPFUL / helpfulReactions) * 100)
      : null;

    // Calculate like ratio (likes vs dislikes)
    const likeReactions = stats.breakdown.LIKE + stats.breakdown.DISLIKE;
    const likeRatio = likeReactions > 0 
      ? Math.round((stats.breakdown.LIKE / likeReactions) * 100)
      : null;

    res.json({
      success: true,
      stats: {
        ...stats,
        helpfulnessScore,
        likeRatio,
        review: {
          id: review.id,
          rating: review.rating,
          createdAt: review.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/reactions/trending - Get reviews with most reactions
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10, days = 7, type } = req.query;
    
    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

    // Build where clause for reactions
    let reactionWhere = {
      createdAt: {
        gte: dateThreshold
      }
    };

    if (type && ['LIKE', 'DISLIKE', 'HELPFUL', 'NOT_HELPFUL'].includes(type)) {
      reactionWhere.type = type;
    }

    // Get reviews with most reactions in the specified period
    const trendingReactions = await prisma.reviewReaction.groupBy({
      by: ['reviewId'],
      where: reactionWhere,
      _count: {
        reviewId: true
      },
      orderBy: {
        _count: {
          reviewId: 'desc'
        }
      },
      take: parseInt(limit)
    });

    // Get review details for trending reviews
    const reviewIds = trendingReactions.map(r => r.reviewId);
    
    const reviews = await prisma.review.findMany({
      where: {
        id: { in: reviewIds }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            isVerified: true
          }
        },
        service: {
          select: {
            id: true,
            vid: true,
            translation: {
              select: {
                name_en: true,
                name_ar: true
              }
            }
          }
        },
        shop: {
          select: {
            id: true,
            vid: true,
            name: true,
            slug: true,
            isVerified: true
          }
        },
        _count: {
          select: {
            reactions: true
          }
        }
      }
    });

    // Sort reviews by reaction count and add reaction counts
    const trendingReviews = reviews
      .map(review => {
        const reactionData = trendingReactions.find(r => r.reviewId === review.id);
        return {
          ...review,
          trendingReactionCount: reactionData?._count.reviewId || 0
        };
      })
      .sort((a, b) => b.trendingReactionCount - a.trendingReactionCount);

    res.json({
      success: true,
      trendingReviews,
      period: `${days} days`,
      reactionType: type || 'all'
    });

  } catch (error) {
    console.error('Error fetching trending reactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to get reaction counts for a review
async function getReactionCounts(reviewId) {
  const reactionCounts = await prisma.reviewReaction.groupBy({
    by: ['type'],
    where: { reviewId },
    _count: {
      type: true
    }
  });

  return reactionCounts.reduce((acc, item) => {
    acc[item.type] = item._count.type;
    return acc;
  }, {
    LIKE: 0,
    DISLIKE: 0,
    HELPFUL: 0,
    NOT_HELPFUL: 0,
    total: reactionCounts.reduce((sum, item) => sum + item._count.type, 0)
  });
}

export default router;
