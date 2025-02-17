const Driver = require('../models/Driver');
const Schedule = require('../models/Schedule');
const Review = require('../models/Review');
const mongoose = require('mongoose');

exports.createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDrivers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const drivers = await Driver.find(query)
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .select('-password');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Get driver's reviews
    const reviews = await Review.find({ driver: req.params.id, status: 'active' })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        ...driver.toObject(),
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Check if driver has active schedules
    const activeSchedules = await Schedule.find({
      driver: req.params.id,
      status: { $in: ['scheduled', 'in-progress'] }
    });

    if (activeSchedules.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete driver with active schedules'
      });
    }

    await driver.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriverStats = async (req, res) => {
  try {
    const stats = await Schedule.aggregate([
      {
        $match: {
          driver: mongoose.Types.ObjectId(req.params.id),
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalDistance: { $sum: '$distance' },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalTrips: 0,
        totalDistance: 0,
        averageRating: 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriverPerformance = async (req, res) => {
  try {
    const driverId = req.params.id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get completed trips data
    const tripsData = await Schedule.aggregate([
      {
        $match: {
          driverId: mongoose.Types.ObjectId(driverId),
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          completedTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledTrips: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
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
          totalTrips: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get ratings data
    const ratingsData = await Review.aggregate([
      {
        $match: {
          driverId: mongoose.Types.ObjectId(driverId),
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          rating: { $avg: '$rating' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate overall metrics
    const metrics = {
      onTimeRate: calculateOnTimeRate(tripsData),
      completionRate: calculateCompletionRate(tripsData),
      averageRating: calculateAverageRating(ratingsData),
      scheduleAdherence: calculateScheduleAdherence(tripsData)
    };

    res.json({
      success: true,
      data: {
        trips: tripsData.map(t => ({
          date: t._id,
          completedTrips: t.completedTrips,
          cancelledTrips: t.cancelledTrips
        })),
        ratings: ratingsData.map(r => ({
          date: r._id,
          rating: r.rating
        })),
        metrics: {
          ...metrics,
          // Format metrics for radar chart
          performance: [
            { name: 'On-Time Rate', value: metrics.onTimeRate },
            { name: 'Completion Rate', value: metrics.completionRate },
            { name: 'Customer Rating', value: metrics.averageRating * 20 }, // Scale to 0-100
            { name: 'Schedule Adherence', value: metrics.scheduleAdherence }
          ]
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper functions for metric calculations
const calculateOnTimeRate = (tripsData) => {
  const totalCompleted = tripsData.reduce((sum, day) => sum + day.completedTrips, 0);
  const totalOnTime = tripsData.reduce((sum, day) => sum + day.onTimeTrips, 0);
  return totalCompleted ? (totalOnTime / totalCompleted) * 100 : 0;
};

const calculateCompletionRate = (tripsData) => {
  const totalTrips = tripsData.reduce((sum, day) => sum + day.totalTrips, 0);
  const completedTrips = tripsData.reduce((sum, day) => sum + day.completedTrips, 0);
  return totalTrips ? (completedTrips / totalTrips) * 100 : 0;
};

const calculateAverageRating = (ratingsData) => {
  const totalRatings = ratingsData.length;
  const sumRatings = ratingsData.reduce((sum, day) => sum + day.rating, 0);
  return totalRatings ? sumRatings / totalRatings : 0;
};

const calculateScheduleAdherence = (tripsData) => {
  const totalTrips = tripsData.reduce((sum, day) => sum + day.totalTrips, 0);
  const adherentTrips = tripsData.reduce(
    (sum, day) => sum + day.onTimeTrips + (day.cancelledTrips * 0.5),
    0
  );
  return totalTrips ? (adherentTrips / totalTrips) * 100 : 0;
}; 