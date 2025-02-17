const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Booking = require('../models/Booking');

router.use(protect, authorize('customer'));

// Get passenger's bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user.id })
      .populate({
        path: 'schedule',
        populate: {
          path: 'route driver',
          select: 'name from to departureTime'
        }
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get passenger's booking history
router.get('/history', async (req, res) => {
  try {
    const bookings = await Booking.find({
      passenger: req.user.id,
      status: { $in: ['completed', 'cancelled'] }
    })
      .populate({
        path: 'schedule',
        populate: {
          path: 'route driver',
          select: 'name from to departureTime'
        }
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get passenger's upcoming trips
router.get('/upcoming', async (req, res) => {
  try {
    const bookings = await Booking.find({
      passenger: req.user.id,
      status: 'confirmed',
      'schedule.departureTime': { $gt: new Date() }
    })
      .populate({
        path: 'schedule',
        populate: {
          path: 'route driver',
          select: 'name from to departureTime'
        }
      })
      .sort({ 'schedule.departureTime': 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 