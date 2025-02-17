const UserActivity = require('../models/UserActivity');
const mongoose = require('mongoose');

exports.getUserActivities = async (req, res) => {
  try {
    const { userId, action, startDate, endDate } = req.query;
    const query = {};

    if (userId) query.user = userId;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const activities = await UserActivity.find(query)
      .populate('user', 'name email')
      .sort('-timestamp')
      .limit(100);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const stats = await UserActivity.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            action: '$action',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          activities: {
            $push: {
              action: '$_id.action',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 