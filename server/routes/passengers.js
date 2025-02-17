const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Add passenger-specific routes here
router.get('/profile', authorize('customer'), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router; 