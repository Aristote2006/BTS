const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  getDriverStats
} = require('../controllers/driverController');

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'superadmin'), getDrivers)
  .post(authorize('admin', 'superadmin'), createDriver);

router
  .route('/:id')
  .get(authorize('admin', 'superadmin', 'driver'), getDriverById)
  .put(authorize('admin', 'superadmin'), updateDriver)
  .delete(authorize('admin', 'superadmin'), deleteDriver);

router.get('/:id/stats', authorize('admin', 'superadmin', 'driver'), getDriverStats);

module.exports = router; 