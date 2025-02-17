const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Review = require('../models/Review');

router.use(protect);

router.post('/', authorize('customer'), async (req, res) => {
  try {
    const review = await Review.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 