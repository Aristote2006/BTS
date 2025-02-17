const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Review = require('../models/Review');
const { startOfDay, endOfDay, subMonths } = require('date-fns');

exports.getPassengerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const [stats, upcomingTrips, recentBookings, favoriteRoutes] = await Promise.all([
      getPassengerStats(userId),
      getUpcomingTrips(userId),
      getRecentBookings(userId),
      getFavoriteRoutes(userId)
    ]);

    res.json({
      success: true,
      data: {
        stats,
        upcomingTrips,
        recentBookings,
        favoriteRoutes
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPassengerStats = async (userId) => {
  const [bookingStats, reviewStats] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          userId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          rewardPoints: { $sum: '$rewardPoints' }
        }
      }
    ]),
    Review.aggregate([
      {
        $match: {
          userId
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ])
  ]);

  const stats = bookingStats[0] || { totalTrips: 0, totalSpent: 0, rewardPoints: 0 };
  const rating = reviewStats[0] || { averageRating: 0 };

  return {
    totalTrips: stats.totalTrips,
    totalSpent: stats.totalSpent,
    rewardPoints: stats.rewardPoints,
    averageRating: rating.averageRating
  };
};

const getUpcomingTrips = async (userId) => {
  return await Booking.find({
    userId,
    status: 'confirmed',
    departureTime: { $gte: new Date() }
  })
  .populate('route')
  .populate('schedule')
  .sort('departureTime')
  .limit(5);
};

const getRecentBookings = async (userId) => {
  return await Booking.find({
    userId
  })
  .populate('route')
  .populate('schedule')
  .sort('-createdAt')
  .limit(10);
};

const getFavoriteRoutes = async (userId) => {
  const sixMonthsAgo = subMonths(new Date(), 6);

  return await Booking.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: '$route',
        tripCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'routes',
        localField: '_id',
        foreignField: '_id',
        as: 'routeDetails'
      }
    },
    { $unwind: '$routeDetails' },
    {
      $project: {
        from: '$routeDetails.from',
        to: '$routeDetails.to',
        tripCount: 1,
        usagePercentage: 1
      }
    },
    { $sort: { tripCount: -1 } },
    { $limit: 5 }
  ]);
}; 