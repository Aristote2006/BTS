const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Schedule = require('../models/Schedule');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('route')
      .populate('driver', 'name');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 