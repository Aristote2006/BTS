const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getBookingAnalytics,
  getAgencyAnalytics
} = require('../controllers/analyticsController');

router.get('/bookings', protect, authorize('admin', 'superadmin'), getBookingAnalytics);
router.get('/agencies', protect, authorize('superadmin'), getAgencyAnalytics);

module.exports = router; 