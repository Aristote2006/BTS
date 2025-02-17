const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  registerUser,
  getUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router
  .route('/')
  .post(protect, authorize('superadmin'), registerUser)
  .get(protect, authorize('admin', 'superadmin'), getUsers);

router
  .route('/:id')
  .put(protect, authorize('superadmin'), updateUser)
  .delete(protect, authorize('superadmin'), deleteUser);

module.exports = router; 