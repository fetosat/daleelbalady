import express from 'express';
import { auth } from '../middleware/auth.js';
import databaseCheck from '../middleware/databaseCheck.js';
import crypto from 'crypto';
import { prisma } from '../lib/db.js';
import { handleDatabaseError, sendErrorResponse, throttledError } from '../utils/errorHandler.js';

const router = express.Router();

// ==================== Family Management ====================

// GET /api/family - Get user's family
router.get('/', databaseCheck, auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is a family head
    let family = await prisma.family.findUnique({
      where: { headId: userId },
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePic: true,
              }
            }
          }
        },
        invitations: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    // If not head, check if member of a family
    if (!family) {
      const membership = await prisma.familyMember.findFirst({
        where: { userId },
        include: {
          family: {
            include: {
              head: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profilePic: true,
                }
              },
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      profilePic: true,
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (membership) {
        family = membership.family;
      }
    }

    res.json({
      success: true,
      family,
      isHead: family?.headId === userId
    });
  } catch (error) {
    const errorInfo = throttledError('family-fetch', error, 'fetching family');
    sendErrorResponse(res, errorInfo, 'fetch family');
  }
});

// POST /api/family - Create a family
router.post('/', databaseCheck, auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    // Check if user already has a family
    const existingFamily = await prisma.family.findUnique({
      where: { headId: userId }
    });

    if (existingFamily) {
      return res.status(400).json({
        success: false,
        message: 'You already have a family'
      });
    }

    // Check if user is member of another family
    const membership = await prisma.familyMember.findFirst({
      where: { userId }
    });

    if (membership) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of another family'
      });
    }

    // Create family
    const family = await prisma.family.create({
      data: {
        name: name || `${req.user.name}'s Family`,
        headId: userId,
        members: {
          create: {
            userId,
            role: 'head'
          }
        }
      },
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePic: true,
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      family,
      message: 'Family created successfully'
    });
  } catch (error) {
    const errorInfo = throttledError('family-create', error, 'creating family');
    sendErrorResponse(res, errorInfo, 'create family');
  }
});

// ==================== Invitations ====================

// POST /api/family/invitations - Send invitation
router.post('/invitations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Get user's family
    const family = await prisma.family.findUnique({
      where: { headId: userId },
      include: {
        members: true,
        invitations: {
          where: {
            status: 'PENDING'
          }
        }
      }
    });

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found. Please create a family first.'
      });
    }

    // Check if family is full
    if (family.members.length >= family.maxMembers) {
      return res.status(400).json({
        success: false,
        message: `Family is full (maximum ${family.maxMembers} members)`
      });
    }

    // Check if email is already invited
    const existingInvitation = await prisma.familyInvitation.findFirst({
      where: {
        familyId: family.id,
        email,
        status: 'PENDING'
      }
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: 'Invitation already sent to this email'
      });
    }

    // Check if user with this email is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      const isMember = await prisma.familyMember.findFirst({
        where: {
          familyId: family.id,
          userId: existingUser.id
        }
      });

      if (isMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a family member'
        });
      }
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Create invitation
    const invitation = await prisma.familyInvitation.create({
      data: {
        familyId: family.id,
        email,
        invitedBy: userId,
        token,
        expiresAt
      }
    });

    // TODO: Send invitation email

    res.json({
      success: true,
      invitation,
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/family/invitations/:id - Cancel invitation
router.delete('/invitations/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const invitation = await prisma.familyInvitation.findUnique({
      where: { id },
      include: {
        family: true
      }
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    // Check if user is family head
    if (invitation.family.headId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only family head can cancel invitations'
      });
    }

    await prisma.familyInvitation.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel invitation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/family/members/:memberId - Remove family member
router.delete('/members/:memberId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { memberId } = req.params;

    // Get user's family
    const family = await prisma.family.findUnique({
      where: { headId: userId },
      include: {
        members: true
      }
    });

    if (!family) {
      return res.status(404).json({
        success: false,
        message: 'Family not found. Only family head can remove members.'
      });
    }

    // Check if trying to remove self (head)
    if (memberId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove yourself as family head'
      });
    }

    // Find the member
    const member = await prisma.familyMember.findFirst({
      where: {
        familyId: family.id,
        userId: memberId
      }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in your family'
      });
    }

    // Remove the member
    await prisma.familyMember.delete({
      where: { id: member.id }
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing family member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== Referrals ====================

// GET /api/family/referrals - Get user's referrals
router.get('/referrals', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate tier based on referral count
    const referralCount = referrals.length;
    let tier = 'BRONZE';
    let tierName = 'برونزي';
    let tierNameEn = 'Bronze';
    let nextTier = 'SILVER';
    let nextTierAt = 6;
    
    if (referralCount >= 16) {
      tier = 'GOLD';
      tierName = 'ذهبي';
      tierNameEn = 'Gold';
      nextTier = null;
      nextTierAt = null;
    } else if (referralCount >= 6) {
      tier = 'SILVER';
      tierName = 'فضي';
      tierNameEn = 'Silver';
      nextTier = 'GOLD';
      nextTierAt = 16;
    }

    res.json({
      success: true,
      referrals: referrals.map(ref => ({
        id: ref.id,
        name: ref.referred?.name || 'Pending',
        email: ref.email || ref.referred?.email,
        joinedAt: ref.registeredAt,
        subscriptionActive: ref.isSubscribed,
        points: ref.totalPoints,
        isRegistered: ref.isRegistered,
        isSubscribed: ref.isSubscribed
      })),
      tier: {
        current: tier,
        currentName: tierName,
        currentNameEn: tierNameEn,
        nextTier,
        nextTierAt,
        progress: nextTierAt ? referralCount : referralCount,
        total: referralCount
      }
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referrals',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/family/referrals/code - Get user's referral code
router.get('/referrals/code', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Generate or get referral code
    const referralCode = `REF-${userId.substring(0, 8).toUpperCase()}`;

    res.json({
      success: true,
      referralCode,
      referralLink: `${process.env.BASE_URL || 'https://daleelbalady.com'}/register?ref=${referralCode}`
    });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== Points & Rewards ====================

// GET /api/family/points - Get user's points
router.get('/points', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    let userPoints = await prisma.userPoints.findUnique({
      where: { userId },
      include: {
        pointTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    // Create points record if doesn't exist
    if (!userPoints) {
      userPoints = await prisma.userPoints.create({
        data: {
          userId,
          currentBalance: 0,
          totalEarned: 0,
          totalSpent: 0
        },
        include: {
          pointTransactions: true
        }
      });
    }

    res.json({
      success: true,
      points: userPoints
    });
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch points',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/family/rewards - Get available rewards
router.get('/rewards', auth, async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        pointsRequired: 'asc'
      }
    });

    res.json({
      success: true,
      rewards
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/family/rewards/:id/redeem - Redeem a reward
router.post('/rewards/:id/redeem', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: rewardId } = req.params;

    // Get reward
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId }
    });

    if (!reward || !reward.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found or not available'
      });
    }

    // Get user points
    let userPoints = await prisma.userPoints.findUnique({
      where: { userId }
    });

    if (!userPoints) {
      userPoints = await prisma.userPoints.create({
        data: {
          userId,
          currentBalance: 0
        }
      });
    }

    // Check if user has enough points
    if (userPoints.currentBalance < reward.pointsRequired) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points',
        required: reward.pointsRequired,
        available: userPoints.currentBalance
      });
    }

    // Check redemption limits
    if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
      return res.status(400).json({
        success: false,
        message: 'Reward redemption limit reached'
      });
    }

    // Create redemption and update points in a transaction
    const result = await prisma.$transaction([
      // Deduct points
      prisma.userPoints.update({
        where: { userId },
        data: {
          currentBalance: { decrement: reward.pointsRequired },
          totalSpent: { increment: reward.pointsRequired }
        }
      }),
      // Create point transaction
      prisma.pointTransaction.create({
        data: {
          userPointsId: userPoints.id,
          amount: -reward.pointsRequired,
          type: 'SPENT',
          source: 'REWARD_REDEMPTION',
          description: `Redeemed: ${reward.title}`,
          metadata: { rewardId }
        }
      }),
      // Create redemption
      prisma.rewardRedemption.create({
        data: {
          rewardId,
          userPointsId: userPoints.id,
          pointsSpent: reward.pointsRequired,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      }),
      // Update reward redemption count
      prisma.reward.update({
        where: { id: rewardId },
        data: {
          currentRedemptions: { increment: 1 }
        }
      })
    ]);

    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      redemption: result[2],
      newBalance: result[0].currentBalance
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem reward',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/family/rewards/my-redemptions - Get user's reward redemptions
router.get('/rewards/my-redemptions', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const userPoints = await prisma.userPoints.findUnique({
      where: { userId }
    });

    if (!userPoints) {
      return res.json({
        success: true,
        redemptions: []
      });
    }

    const redemptions = await prisma.rewardRedemption.findMany({
      where: {
        userPointsId: userPoints.id
      },
      include: {
        reward: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      redemptions
    });
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch redemptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

