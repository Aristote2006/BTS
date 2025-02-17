const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Driver = require('../models/Driver');
const { startOfDay, endOfDay } = require('date-fns');

exports.getAdminDashboard = async (req, res) => {
  try {
    const agencyId = req.user.agencyId;
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const [
      todayStats,
      recentBookings,
      routePerformance,
      driverStats
    ] = await Promise.all([
      getTodayStats(agencyId, startOfToday, endOfToday),
      getRecentBookings(agencyId),
      getRoutePerformance(agencyId),
      getDriverStats(agencyId)
    ]);

    res.json({
      success: true,
      data: {
        todayStats,
        recentBookings,
        routePerformance,
        driverStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTodayStats = async (agencyId, startOfToday, endOfToday) => {
  const [bookingStats, routeStats] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          agencyId,
          createdAt: {
            $gte: startOfToday,
            $lte: endOfToday
          }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]),
    Schedule.aggregate([
      {
        $match: {
          agencyId,
          date: {
            $gte: startOfToday,
            $lte: endOfToday
          }
        }
      },
      {
        $group: {
          _id: null,
          activeRoutes: {
            $sum: {
              $cond: [
                { $in: ['$status', ['scheduled', 'inProgress']] },
                1,
                0
              ]
            }
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
          },
          totalCompletedTrips: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);

  const stats = bookingStats[0] || { totalBookings: 0, totalRevenue: 0 };
  const route = routeStats[0] || { activeRoutes: 0, onTimeTrips: 0, totalCompletedTrips: 0 };

  return {
    totalBookings: stats.totalBookings,
    totalRevenue: stats.totalRevenue,
    activeRoutes: route.activeRoutes,
    onTimeRate: route.totalCompletedTrips > 0
      ? (route.onTimeTrips / route.totalCompletedTrips) * 100
      : 100
  };
};

const getRecentBookings = async (agencyId) => {
  return await Booking.aggregate([
    {
      $match: { agencyId }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $limit: 24
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%H:00',
            date: '$createdAt'
          }
        },
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

const getRoutePerformance = async (agencyId) => {
  return await Schedule.aggregate([
    {
      $match: {
        agencyId,
        status: { $in: ['scheduled', 'inProgress'] }
      }
    },
    {
      $lookup: {
        from: 'routes',
        localField: 'route',
        foreignField: '_id',
        as: 'routeDetails'
      }
    },
    { $unwind: '$routeDetails' },
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'schedule',
        as: 'bookings'
      }
    },
    {
      $project: {
        route: { $concat: ['$routeDetails.from', ' → ', '$routeDetails.to'] },
        occupancy: {
          $multiply: [
            { $divide: [{ $size: '$bookings' }, '$availableSeats'] },
            100
          ]
        }
      }
    },
    {
      $group: {
        _id: '$route',
        occupancy: { $avg: '$occupancy' }
      }
    },
    {
      $project: {
        _id: 0,
        route: '$_id',
        occupancy: 1
      }
    }
  ]);
};

const getDriverStats = async (agencyId) => {
  return await Driver.aggregate([
    {
      $match: { agencyId }
    },
    {
      $lookup: {
        from: 'schedules',
        localField: '_id',
        foreignField: 'driverId',
        as: 'schedules'
      }
    },
    {
      $project: {
        name: 1,
        status: 1,
        completedTrips: '$stats.completedTrips',
        rating: '$stats.rating',
        onTimeRate: '$stats.onTimeRate'
      }
    },
    { $sort: { completedTrips: -1 } },
    { $limit: 10 }
  ]);
}; 