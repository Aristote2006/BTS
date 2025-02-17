const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { registerUser, loginUser } = require('../controllers/userController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  // Implement registration logic (e.g., save user to database)
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user / Clear cookie
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({ success: true });
});

// @route   POST /api/auth/reset-password
// @desc    Reset user password
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { code, newPassword } = req.body;

  // Verify the reset code (this could involve checking a database or cache)
  // For example, you might have a function to verify the code:
  const isValidCode = await verifyResetCode(code); // Implement this function

  if (!isValidCode) {
    return res.status(400).json({ message: 'Invalid reset code' });
  }

  // Update the user's password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  // Assuming you have a way to get the user by the reset code
  const user = await User.findOneAndUpdate({ resetCode: code }, { password: hashedPassword });

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  res.json({ success: true, message: 'Password reset successfully' });
});

module.exports = router; 