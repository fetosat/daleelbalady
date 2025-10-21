import express from 'express';
import { PrismaClient } from '../generated/prisma/client.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/analytics/track-profile-view - Track profile view
router.post('/track-profile-view', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Create or update user analytics
    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        profileViews: {
          increment: 1
        }
      },
      create: {
        userId,
        profileViews: 1
      }
    });

    res.json({
      success: true,
      message: 'Profile view tracked'
    });

  } catch (error) {
    console.error('Error tracking profile view:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/analytics/track-service-view - Track service view
router.post('/track-service-view', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        serviceViews: {
          increment: 1
        }
      },
      create: {
        userId,
        serviceViews: 1
      }
    });

    res.json({
      success: true,
      message: 'Service view tracked'
    });

  } catch (error) {
    console.error('Error tracking service view:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/analytics/track-shop-view - Track shop view
router.post('/track-shop-view', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        shopViews: {
          increment: 1
        }
      },
      create: {
        userId,
        shopViews: 1
      }
    });

    res.json({
      success: true,
      message: 'Shop view tracked'
    });

  } catch (error) {
    console.error('Error tracking shop view:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/analytics/track-contact-click - Track contact clicks
router.post('/track-contact-click', async (req, res) => {
  try {
    const { userId, type } = req.body; // type: 'contact', 'email', 'phone'

    if (!userId || !type) {
      return res.status(400).json({
        success: false,
        message: 'User ID and contact type are required'
      });
    }

    const updateData = {};
    switch (type) {
      case 'contact':
        updateData.contactClicks = { increment: 1 };
        break;
      case 'email':
        updateData.emailClicks = { increment: 1 };
        break;
      case 'phone':
        updateData.phoneClicks = { increment: 1 };
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid contact type'
        });
    }

    await prisma.userAnalytics.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...Object.fromEntries(
          Object.entries(updateData).map(([key, value]) => [key, value.increment])
        )
      }
    });

    res.json({
      success: true,
      message: `${type} click tracked`
    });

  } catch (error) {
    console.error('Error tracking contact click:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/analytics/track-message - Track message sent/received
router.post('/track-message', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Sender and receiver IDs are required'
      });
    }

    // Update sender analytics
    await prisma.userAnalytics.upsert({
      where: { userId: senderId },
      update: {
        messagesSent: {
          increment: 1
        }
      },
      create: {
        userId: senderId,
        messagesSent: 1
      }
    });

    // Update receiver analytics
    await prisma.userAnalytics.upsert({
      where: { userId: receiverId },
      update: {
        messagesReceived: {
          increment: 1
        }
      },
      create: {
        userId: receiverId,
        messagesReceived: 1
      }
    });

    res.json({
      success: true,
      message: 'Message tracked'
    });

  } catch (error) {
    console.error('Error tracking message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/analytics/track-booking - Track booking creation
router.post('/track-booking', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        totalBookings: {
          increment: 1
        }
      },
      create: {
        userId,
        totalBookings: 1
      }
    });

    res.json({
      success: true,
      message: 'Booking tracked'
    });

  } catch (error) {
    console.error('Error tracking booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/analytics/track-order - Track order creation
router.post('/track-order', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        totalOrders: {
          increment: 1
        }
      },
      create: {
        userId,
        totalOrders: 1
      }
    });

    res.json({
      success: true,
      message: 'Order tracked'
    });

  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/analytics/track-review - Track review given/received
router.post('/track-review', async (req, res) => {
  try {
    const { authorId, serviceOwnerId } = req.body;

    if (!authorId || !serviceOwnerId) {
      return res.status(400).json({
        success: false,
        message: 'Author and service owner IDs are required'
      });
    }

    // Update review giver analytics
    await prisma.userAnalytics.upsert({
      where: { userId: authorId },
      update: {
        reviewsGiven: {
          increment: 1
        }
      },
      create: {
        userId: authorId,
        reviewsGiven: 1
      }
    });

    // Update review receiver analytics
    await prisma.userAnalytics.upsert({
      where: { userId: serviceOwnerId },
      update: {
        reviewsReceived: {
          increment: 1
        }
      },
      create: {
        userId: serviceOwnerId,
        reviewsReceived: 1
      }
    });

    res.json({
      success: true,
      message: 'Review tracked'
    });

  } catch (error) {
    console.error('Error tracking review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/analytics/track-reaction - Track review reaction
router.post('/track-reaction', async (req, res) => {
  try {
    const { userId, reviewAuthorId } = req.body;

    if (!userId || !reviewAuthorId) {
      return res.status(400).json({
        success: false,
        message: 'User and review author IDs are required'
      });
    }

    // Update reaction giver analytics
    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        reactionsGiven: {
          increment: 1
        }
      },
      create: {
        userId,
        reactionsGiven: 1
      }
    });

    // Update reaction receiver analytics
    await prisma.userAnalytics.upsert({
      where: { userId: reviewAuthorId },
      update: {
        reactionsReceived: {
          increment: 1
        }
      },
      create: {
        userId: reviewAuthorId,
        reactionsReceived: 1
      }
    });

    res.json({
      success: true,
      message: 'Reaction tracked'
    });

  } catch (error) {
    console.error('Error tracking reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/analytics/:userId/response-time - Update average response time
router.put('/:userId/response-time', async (req, res) => {
  try {
    const { userId } = req.params;
    const { responseTime } = req.body; // in minutes

    if (!responseTime || isNaN(responseTime)) {
      return res.status(400).json({
        success: false,
        message: 'Valid response time is required'
      });
    }

    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    });

    let newAvgResponseTime;
    if (analytics && analytics.avgResponseTime) {
      // Calculate weighted average
      newAvgResponseTime = Math.round((analytics.avgResponseTime + responseTime) / 2);
    } else {
      newAvgResponseTime = responseTime;
    }

    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        avgResponseTime: newAvgResponseTime
      },
      create: {
        userId,
        avgResponseTime: responseTime
      }
    });

    res.json({
      success: true,
      message: 'Response time updated',
      avgResponseTime: newAvgResponseTime
    });

  } catch (error) {
    console.error('Error updating response time:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/analytics/:userId/success-rate - Update success rate
router.put('/:userId/success-rate', async (req, res) => {
  try {
    const { userId } = req.params;
    const { successRate } = req.body; // percentage 0-100

    if (successRate === undefined || isNaN(successRate) || successRate < 0 || successRate > 100) {
      return res.status(400).json({
        success: false,
        message: 'Valid success rate (0-100) is required'
      });
    }

    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        successRate: parseFloat(successRate)
      },
      create: {
        userId,
        successRate: parseFloat(successRate)
      }
    });

    res.json({
      success: true,
      message: 'Success rate updated'
    });

  } catch (error) {
    console.error('Error updating success rate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to calculate date range based on period
const getDateRange = (period) => {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  return { startDate, endDate: now };
};

// Helper to format month names
const getMonthName = (date) => {
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  return months[date.getMonth()];
};

// Helper to format day names
const getDayName = (date) => {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[date.getDay()];
};

// GET /api/analytics/provider/:providerId - Get comprehensive provider analytics
router.get('/provider/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    const { period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    // Fetch bookings data
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { service: { ownerUserId: providerId } },
          { shop: { ownerId: providerId } }
        ],
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        service: {
          select: {
            id: true,
            translation: true,
            price: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Fetch reviews data
    const reviews = await prisma.review.findMany({
      where: {
        service: {
          ownerUserId: providerId
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        service: {
          select: {
            id: true,
            translation: true
          }
        }
      }
    });

    // Get all reviews for average rating
    const allReviews = await prisma.review.findMany({
      where: {
        service: {
          ownerUserId: providerId
        }
      },
      select: {
        rating: true
      }
    });

    // Fetch orders data (if exists)
    let orders = [];
    try {
      orders = await prisma.order.findMany({
        where: {
          OR: [
            { service: { ownerUserId: providerId } },
            { shop: { ownerId: providerId } }
          ],
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.log('Orders table might not exist:', error.message);
    }

    // Calculate metrics
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    // Calculate earnings
    const bookingEarnings = bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + (parseFloat(b.service?.price) || 0), 0);

    const orderEarnings = orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => {
        const orderTotal = o.items.reduce((itemSum, item) =>
          itemSum + (parseFloat(item.product?.price) || 0) * item.quantity, 0
        );
        return sum + orderTotal;
      }, 0);

    const totalEarnings = bookingEarnings + orderEarnings;

    // Calculate previous period earnings for growth
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (endDate - startDate) / (1000 * 60 * 60 * 24));

    const previousBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { service: { ownerUserId: providerId } },
          { shop: { ownerId: providerId } }
        ],
        status: 'COMPLETED',
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      },
      include: {
        service: {
          select: { price: true }
        }
      }
    });

    const previousEarnings = previousBookings.reduce((sum, b) =>
      sum + (parseFloat(b.service?.price) || 0), 0
    );

    const earningsGrowth = previousEarnings > 0
      ? ((totalEarnings - previousEarnings) / previousEarnings) * 100
      : 100;

    // Calculate average rating
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    // Calculate customer retention
    const uniqueCustomers = new Set(bookings.map(b => b.userId));
    const returningCustomers = new Set();
    const customerBookingCount = {};

    bookings.forEach(b => {
      customerBookingCount[b.userId] = (customerBookingCount[b.userId] || 0) + 1;
      if (customerBookingCount[b.userId] > 1) {
        returningCustomers.add(b.userId);
      }
    });

    const retentionRate = uniqueCustomers.size > 0
      ? (returningCustomers.size / uniqueCustomers.size) * 100
      : 0;

    // Monthly earnings chart data
    const monthlyEarnings = [];
    const months = period === 'year' ? 12 : period === 'quarter' ? 3 : 1;

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate >= monthStart && bookingDate <= monthEnd && b.status === 'COMPLETED';
      });

      const monthEarnings = monthBookings.reduce((sum, b) =>
        sum + (parseFloat(b.service?.price) || 0), 0
      );

      monthlyEarnings.push({
        month: getMonthName(monthDate),
        earnings: monthEarnings
      });
    }

    // Customer activity (last 7 days)
    const customerActivity = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - i);
      const dayStart = new Date(dayDate.setHours(0, 0, 0, 0));
      const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999));

      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate >= dayStart && bookingDate <= dayEnd;
      });

      const dayCompletions = dayBookings.filter(b => b.status === 'COMPLETED').length;

      customerActivity.push({
        day: getDayName(dayDate),
        bookings: dayBookings.length,
        completions: dayCompletions
      });
    }

    // Service performance
    const serviceMap = {};
    bookings.forEach(b => {
      if (!b.service) return;

      if (!serviceMap[b.service.id]) {
        serviceMap[b.service.id] = {
          id: b.service.id,
          name: b.service.translation.name_ar || 'غير معروف',
          bookings: 0,
          revenue: 0,
          reviews: []
        };
      }

      serviceMap[b.service.id].bookings++;
      if (b.status === 'COMPLETED') {
        serviceMap[b.service.id].revenue += parseFloat(b.service.price) || 0;
      }
    });

    reviews.forEach(r => {
      if (r.service && serviceMap[r.service.id]) {
        serviceMap[r.service.id].reviews.push(r.rating);
      }
    });

    const servicePerformance = Object.values(serviceMap).map(service => {
      const avgRating = service.reviews.length > 0
        ? service.reviews.reduce((sum, r) => sum + r, 0) / service.reviews.length
        : 0;

      return {
        id: service.id,
        name: service.name,
        bookings: service.bookings,
        revenue: service.revenue,
        rating: avgRating,
        trend: service.revenue > (totalEarnings / Object.keys(serviceMap).length) ? 'up' : 'down'
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Earnings breakdown - REAL DATA ONLY
    const earningsBreakdown = {
      services: bookingEarnings,
      products: orderEarnings
      // Tips removed - no dummy data
    };

    // Performance metrics - Calculate from actual user analytics data
    const userAnalytics = await prisma.userAnalytics.findUnique({
      where: { userId: providerId }
    });
    
    const responseTime = {
      average: userAnalytics?.avgResponseTime || 0, // Real data from userAnalytics table
      target: 180 // 3 hours in minutes
    };

    const onTimeBookings = bookings.filter(b => {
      // Assuming on-time if COMPLETED within scheduled time
      return b.status === 'COMPLETED';
    }).length;

    const onTimeRate = {
      rate: totalBookings > 0 ? (onTimeBookings / totalBookings) * 100 : 0,
      onTime: onTimeBookings,
      total: totalBookings
    };

    const promoters = reviews.filter(r => r.rating >= 4).length;
    const customerSatisfaction = {
      score: reviews.length > 0 ? (promoters / reviews.length) * 100 : 0,
      promoters,
      total: reviews.length
    };

    // Rating distribution
    const ratingDistribution = {
      star5: allReviews.filter(r => r.rating === 5).length,
      star4: allReviews.filter(r => r.rating === 4).length,
      star3: allReviews.filter(r => r.rating === 3).length,
      star2: allReviews.filter(r => r.rating === 2).length,
      star1: allReviews.filter(r => r.rating === 1).length,
      total: allReviews.length
    };

    // Build response
    const analyticsData = {
      metrics: {
        earnings: {
          total: totalEarnings,
          growth: earningsGrowth,
          trend: earningsGrowth >= 0 ? 'up' : 'down'
        },
        completionRate: {
          rate: completionRate,
          total: totalBookings,
          COMPLETED: completedBookings
        },
        averageRating: {
          rating: averageRating,
          totalReviews: allReviews.length
        },
        customerRetention: {
          rate: retentionRate,
          returningCustomers: returningCustomers.size,
          totalCustomers: uniqueCustomers.size
        }
      },
      monthlyEarnings,
      customerActivity,
      servicePerformance,
      earningsBreakdown,
      performanceMetrics: {
        responseTime,
        onTimeRate,
        customerSatisfaction
      },
      ratingDistribution,
      period
    };

    res.json(analyticsData);

  } catch (error) {
    console.error('Error fetching provider analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/analytics/:userId - Get user analytics
// IMPORTANT: This route must be AFTER /provider/:providerId to avoid route conflicts
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const analytics = await prisma.userAnalytics.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    if (!analytics) {
      return res.json({
        success: true,
        analytics: {
          userId,
          profileViews: 0,
          serviceViews: 0,
          shopViews: 0,
          contactClicks: 0,
          emailClicks: 0,
          phoneClicks: 0,
          messagesSent: 0,
          messagesReceived: 0,
          totalBookings: 0,
          totalOrders: 0,
          avgResponseTime: null,
          successRate: null,
          reviewsGiven: 0,
          reviewsReceived: 0,
          reactionsGiven: 0,
          reactionsReceived: 0
        }
      });
    }

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
