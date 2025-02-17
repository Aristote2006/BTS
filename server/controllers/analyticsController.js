const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Agency = require('../models/Agency');
const mongoose = require('mongoose');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const { subDays, subMonths } = require('date-fns');

exports.getBookingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, agencyId } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (agencyId) {
      const routes = await Route.find({ agency: agencyId }).select('_id');
      query.route = { $in: routes.map(r => r._id) };
    }

    const bookingStats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          confirmedBookings: {
            $sum: {
              $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const popularRoutes = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$route",
          totalBookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "routes",
          localField: "_id",
          foreignField: "_id",
          as: "routeDetails"
        }
      },
      { $unwind: "$routeDetails" }
    ]);

    res.json({
      success: true,
      data: {
        bookingStats,
        popularRoutes
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAgencyAnalytics = async (req, res) => {
  try {
    const agencyStats = await Agency.aggregate([
      {
        $lookup: {
          from: "routes",
          localField: "_id",
          foreignField: "agency",
          as: "routes"
        }
      },
      {
        $lookup: {
          from: "bookings",
          localField: "routes._id",
          foreignField: "route",
          as: "bookings"
        }
      },
      {
        $project: {
          name: 1,
          totalRoutes: { $size: "$routes" },
          totalBookings: { $size: "$bookings" },
          totalRevenue: { $sum: "$bookings.totalAmount" },
          averageBookingsPerRoute: {
            $divide: [{ $size: "$bookings" }, { $size: "$routes" }]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: agencyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, agencyId } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (agencyId) {
      const routes = await Route.find({ agency: agencyId }).select('_id');
      query.route = { $in: routes.map(r => r._id) };
    }

    const revenueStats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" },
          bookings: { $sum: 1 },
          averageTicketPrice: { $avg: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const paymentMethodStats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        revenueStats,
        paymentMethodStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerAnalytics = async (req, res) => {
  try {
    const customerStats = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'user',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          totalBookings: { $size: '$bookings' },
          totalSpent: { $sum: '$bookings.totalAmount' },
          averageTicketPrice: {
            $cond: [
              { $gt: [{ $size: '$bookings' }, 0] },
              { $divide: [{ $sum: '$bookings.totalAmount' }, { $size: '$bookings' }] },
              0
            ]
          }
        }
      },
      { $sort: { totalBookings: -1 } }
    ]);

    res.json({
      success: true,
      data: customerStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, agencyId } = req.query;
    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (agencyId && agencyId !== 'all') {
      const routes = await Route.find({ agency: agencyId }).select('_id');
      query.route = { $in: routes.map(r => r._id) };
    }

    // Get booking stats
    const bookingStats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.date": 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          bookings: 1,
          revenue: 1
        }
      }
    ]);

    // Get route performance
    const routePerformance = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$route",
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $lookup: {
          from: "routes",
          localField: "_id",
          foreignField: "_id",
          as: "routeDetails"
        }
      },
      { $unwind: "$routeDetails" },
      {
        $project: {
          route: { $concat: ["$routeDetails.from", " → ", "$routeDetails.to"] },
          bookings: 1,
          revenue: 1
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    // Get payment methods distribution
    const paymentMethods = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$paymentMethod",
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: "$_id",
          value: 1,
          _id: 0
        }
      }
    ]);

    // Get overall stats
    const totalStats = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          successfulBookings: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalBookings: 1,
          totalRevenue: 1,
          averageBookingValue: { $divide: ["$totalRevenue", "$totalBookings"] },
          bookingSuccessRate: {
            $multiply: [
              { $divide: ["$successfulBookings", "$totalBookings"] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        bookingStats,
        routePerformance,
        paymentMethods,
        ...totalStats[0]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRealTimeAnalytics = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));

    // Get today's bookings
    const bookings = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$createdAt" },
            minute: {
              $subtract: [
                { $minute: "$createdAt" },
                { $mod: [{ $minute: "$createdAt" }, 15] }
              ]
            }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $project: {
          _id: 0,
          time: {
            $concat: [
              { $toString: "$_id.hour" },
              ":",
              {
                $cond: {
                  if: { $lt: ["$_id.minute", 10] },
                  then: { $concat: ["0", { $toString: "$_id.minute" }] },
                  else: { $toString: "$_id.minute" }
                }
              }
            ]
          },
          count: 1,
          revenue: 1
        }
      },
      { $sort: { time: 1 } }
    ]);

    // Get route performance
    const routePerformance = await Schedule.aggregate([
      {
        $match: {
          date: { $gte: startOfDay },
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
          bookings: { $size: '$bookings' },
          occupancy: {
            $multiply: [
              {
                $divide: [
                  { $size: '$bookings' },
                  '$availableSeats'
                ]
              },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        routePerformance,
        currentStats: {
          activeBookings: await Booking.countDocuments({
            status: { $in: ['pending', 'confirmed'] },
            createdAt: { $gte: startOfDay }
          }),
          todayRevenue: (await Booking.aggregate([
            {
              $match: {
                createdAt: { $gte: startOfDay }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$totalAmount' }
              }
            }
          ]))[0]?.total || 0,
          occupancyRate: routePerformance.reduce((acc, curr) => acc + curr.occupancy, 0) / routePerformance.length,
          onTimeRate: 95 // This should be calculated based on actual schedule data
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdvancedAnalytics = async (req, res) => {
  try {
    const { timeRange, type } = req.query;
    const startDate = getStartDate(timeRange);
    
    let analyticsData = {};

    switch (type) {
      case 'revenue':
        analyticsData = await getRevenueAnalytics(startDate);
        break;
      case 'routes':
        analyticsData = await getRouteAnalytics(startDate);
        break;
      case 'occupancy':
        analyticsData = await getOccupancyAnalytics(startDate);
        break;
      case 'performance':
        analyticsData = await getPerformanceMetrics(startDate);
        break;
    }

    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStartDate = (timeRange) => {
  const now = new Date();
  switch (timeRange) {
    case 'week':
      return subDays(now, 7);
    case 'month':
      return subMonths(now, 1);
    case 'quarter':
      return subMonths(now, 3);
    default:
      return subDays(now, 7);
  }
};

const getRevenueAnalytics = async (startDate) => {
  const revenue = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: 1,
        projectedRevenue: {
          $multiply: ['$revenue', 1.2] // Simple projection, can be more sophisticated
        }
      }
    },
    { $sort: { date: 1 } }
  ]);

  return { revenue };
};

const getRouteAnalytics = async (startDate) => {
  const routes = await Schedule.aggregate([
    {
      $match: {
        date: { $gte: startDate }
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
      $group: {
        _id: '$route',
        route: { $first: { $concat: ['$routeDetails.from', ' → ', '$routeDetails.to'] } },
        bookings: { $sum: { $size: '$bookings' } },
        totalCapacity: { $sum: '$availableSeats' },
        schedules: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        route: 1,
        bookings: 1,
        occupancyRate: {
          $multiply: [
            { $divide: ['$bookings', '$totalCapacity'] },
            100
          ]
        }
      }
    },
    { $sort: { bookings: -1 } }
  ]);

  return { routes };
};

const getOccupancyAnalytics = async (startDate) => {
  const occupancy = await Schedule.aggregate([
    {
      $match: {
        date: { $gte: startDate }
      }
    },
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
        hour: { $hour: '$departureTime' },
        isWeekend: {
          $in: [
            { $dayOfWeek: '$date' },
            [1, 7] // Sunday = 1, Saturday = 7
          ]
        },
        occupancyRate: {
          $multiply: [
            {
              $divide: [
                { $size: '$bookings' },
                '$availableSeats'
              ]
            },
            100
          ]
        }
      }
    },
    {
      $group: {
        _id: {
          hour: '$hour',
          isWeekend: '$isWeekend'
        },
        avgOccupancy: { $avg: '$occupancyRate' }
      }
    },
    {
      $group: {
        _id: '$_id.hour',
        weekday: {
          $max: {
            $cond: [
              { $eq: ['$_id.isWeekend', false] },
              '$avgOccupancy',
              0
            ]
          }
        },
        weekend: {
          $max: {
            $cond: [
              { $eq: ['$_id.isWeekend', true] },
              '$avgOccupancy',
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        hour: '$_id',
        weekday: 1,
        weekend: 1
      }
    },
    { $sort: { hour: 1 } }
  ]);

  return { occupancy };
};

const getPerformanceMetrics = async (startDate) => {
  const [bookingDistribution, peakHours] = await Promise.all([
    Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: 1
        }
      }
    ]),
    Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          bookings: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          hour: '$_id',
          bookings: 1
        }
      },
      { $sort: { hour: 1 } }
    ])
  ]);

  return {
    performance: {
      bookingDistribution,
      peakHours
    }
  };
}; 