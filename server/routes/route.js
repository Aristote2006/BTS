const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createRoute,
  getRoutes,
  updateRoute,
  deleteRoute
} = require('../controllers/routeController');

router
  .route('/')
  .post(protect, authorize('admin', 'superadmin'), createRoute)
  .get(getRoutes);

router
  .route('/:id')
  .put(protect, authorize('admin', 'superadmin'), updateRoute)
  .delete(protect, authorize('admin', 'superadmin'), deleteRoute);

module.exports = router; 