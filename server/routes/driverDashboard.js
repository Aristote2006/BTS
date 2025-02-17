const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Schedule = require('../models/Schedule');
const Booking = require('../models/Booking');

router.use(protect, authorize('driver'));

// Get driver's schedule
router.get('/schedule', async (req, res) => {
  try {
    const schedules = await Schedule.find({ driver: req.user.id })
      .populate('route')
      .sort({ departureTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver's current bookings
router.get('/bookings', async (req, res) => {
  try {
    const schedules = await Schedule.find({ driver: req.user.id });
    const bookings = await Booking.find({
      schedule: { $in: schedules.map(s => s._id) },
      status: 'confirmed'
    }).populate('passenger', 'name');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver's performance stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Schedule.aggregate([
      { $match: { driver: req.user._id } },
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          onTimeDelivery: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed_on_time'] }, 1, 0]
            }
          }
        }
      }
    ]);
    res.json(stats[0] || { totalTrips: 0, onTimeDelivery: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 