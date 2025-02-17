const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createAgency,
  getAgencies,
  updateAgency,
  deleteAgency
} = require('../controllers/agencyController');

router
  .route('/')
  .post(protect, authorize('superadmin'), createAgency)
  .get(protect, authorize('superadmin', 'admin'), getAgencies);

router
  .route('/:id')
  .put(protect, authorize('superadmin'), updateAgency)
  .delete(protect, authorize('superadmin'), deleteAgency);

module.exports = router; 