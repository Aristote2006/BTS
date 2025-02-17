const Driver = require('../models/Driver');
const Schedule = require('../models/Schedule');
const Review = require('../models/Review');
const Route = require('../models/Route');
const { startOfDay, endOfDay, subDays } = require('date-fns');

exports.getDriverDashboard = async (req, res) => {
  try {
    const driverId = req.user._id;
    const today = new Date();

    const [
      currentSchedule,
      upcomingSchedules,
      performance,
      rewards,
      recentReviews
    ] = await Promise.all([
      getCurrentSchedule(driverId, today),
      getUpcomingSchedules(driverId, today),
      getDriverPerformance(driverId),
      getDriverRewards(driverId),
      getRecentReviews(driverId)
    ]);

    res.json({
      success: true,
      data: {
        currentSchedule,
        upcomingSchedules,
        performance,
        rewards,
        recentReviews
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentSchedule = async (driverId, today) => {
  return await Schedule.findOne({
    driverId,
    date: {
      $gte: startOfDay(today),
      $lte: endOfDay(today)
    },
    status: { $in: ['scheduled', 'in-progress'] }
  }).populate('route');
};

const getUpcomingSchedules = async (driverId, today) => {
  return await Schedule.find({
    driverId,
    date: { $gt: today },
    status: 'scheduled'
  })
  .populate('route')
  .sort('date')
  .limit(5);
};

const getDriverPerformance = async (driverId) => {
  const thirtyDaysAgo = subDays(new Date(), 30);
  
  const [scheduleStats, reviewStats] = await Promise.all([
    Schedule.aggregate([
      {
        $match: {
          driverId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          completedTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          onTimeTrips: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'completed'] },
                    { $lte: ['$actualArrivalTime', '$estimatedArrivalTime'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]),
    Review.aggregate([
      {
        $match: {
          driverId,
          createdAt: { $gte: thirtyDaysAgo }
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

  const stats = scheduleStats[0] || { totalTrips: 0, completedTrips: 0, onTimeTrips: 0 };
  
  return {
    rating: reviewStats[0]?.averageRating || 0,
    completionRate: stats.totalTrips ? (stats.completedTrips / stats.totalTrips) * 100 : 0,
    onTimeRate: stats.completedTrips ? (stats.onTimeTrips / stats.completedTrips) * 100 : 0,
    totalTrips: stats.totalTrips
  };
};

const getDriverRewards = async (driverId) => {
  const driver = await Driver.findById(driverId).select('rewards stats');
  const points = driver.stats.points || 0;
  const level = calculateRewardLevel(points);
  
  return {
    points,
    level: level.name,
    nextLevelProgress: level.progress,
    achievements: driver.rewards.achievements || []
  };
};

const getRecentReviews = async (driverId) => {
  return await Review.find({ driverId })
    .sort('-createdAt')
    .limit(5);
};

const calculateRewardLevel = (points) => {
  const levels = [
    { name: 'Bronze', threshold: 0 },
    { name: 'Silver', threshold: 1000 },
    { name: 'Gold', threshold: 2500 },
    { name: 'Platinum', threshold: 5000 }
  ];

  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = 1; i < levels.length; i++) {
    if (points >= levels[i].threshold) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[i];
    }
  }

  const progress = nextLevel.threshold === currentLevel.threshold
    ? 100
    : ((points - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100;

  return {
    name: currentLevel.name,
    progress: Math.min(100, progress)
  };
}; 