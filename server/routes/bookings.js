const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getActiveBookings,
  getPastBookings,
  createBooking,
  getBookingDetails
} = require('../controllers/bookingController');

// Protected routes
router.use(protect);

router.get('/active', getActiveBookings);
router.get('/past', getPastBookings);
router.post('/', createBooking);
router.get('/:id', getBookingDetails);

module.exports = router; 