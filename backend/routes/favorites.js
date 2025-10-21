import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get user's favorite shops
router.get('/shops', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            city: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      favorites: favorites.map(fav => fav.shop)
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorites'
    });
  }
});

// Check if a shop is favorited
router.get('/shops/:shopId/check', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { shopId } = req.params;

    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_shopId: {
          userId,
          shopId
        }
      }
    });

    res.json({
      success: true,
      isFavorited: !!favorite
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check favorite status'
    });
  }
});

// Add shop to favorites
router.post('/shops', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { shopId } = req.body;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        error: 'Shop ID is required'
      });
    }

    // Verify shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        error: 'Shop not found'
      });
    }

    // Create or get existing favorite (upsert to avoid duplicates)
    const favorite = await prisma.userFavorite.upsert({
      where: {
        userId_shopId: {
          userId,
          shopId
        }
      },
      update: {},
      create: {
        userId,
        shopId
      }
    });

    res.json({
      success: true,
      message: 'Shop added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add favorite'
    });
  }
});

// Remove shop from favorites
router.delete('/shops/:shopId', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { shopId } = req.params;

    await prisma.userFavorite.deleteMany({
      where: {
        userId,
        shopId
      }
    });

    res.json({
      success: true,
      message: 'Shop removed from favorites'
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove favorite'
    });
  }
});

export default router;

