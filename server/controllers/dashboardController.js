const Agency = require('../models/Agency');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');

exports.getDashboardData = async (req, res) => {
  try {
    const [agencies, analytics, optimization] = await Promise.all([
      getAgencySummary(),
      getAnalyticsSummary(),
      getOptimizationStatus()
    ]);

    res.json({
      success: true,
      data: {
        agencies,
        analytics,
        optimization
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAgencySummary = async () => {
  const agencies = await Agency.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'agencyId',
        as: 'admins'
      }
    },
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'agencyId',
        as: 'bookings'
      }
    },
    {
      $project: {
        name: 1,
        status: 1,
        adminCount: { $size: '$admins' },
        bookingsCount: { $size: '$bookings' },
        revenue: {
          $sum: '$bookings.totalAmount'
        }
      }
    }
  ]);

  return agencies;
};

const getAnalyticsSummary = async () => {
  const [agencyCount, adminCount, revenueStats] = await Promise.all([
    Agency.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ])
  ]);

  return {
    totalAgencies: agencyCount,
    totalAdmins: adminCount,
    totalRevenue: revenueStats[0]?.totalRevenue || 0
  };
};

const getOptimizationStatus = async () => {
  const [scheduleStats, conflictStats] = await Promise.all([
    Schedule.aggregate([
      {
        $group: {
          _id: null,
          totalSchedules: { $sum: 1 },
          onTimeSchedules: {
            $sum: {
              $cond: [
                { $lte: ['$actualArrivalTime', '$estimatedArrivalTime'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]),
    Schedule.countDocuments({ hasConflict: true })
  ]);

  return {
    routeEfficiency: scheduleStats[0]
      ? (scheduleStats[0].onTimeSchedules / scheduleStats[0].totalSchedules) * 100
      : 0,
    conflictRate: scheduleStats[0]
      ? (conflictStats / scheduleStats[0].totalSchedules) * 100
      : 0,
    systemHealth: 100 - (conflictStats / scheduleStats[0]?.totalSchedules || 0) * 100
  };
}; 