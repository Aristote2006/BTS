const UserActivity = require('../models/UserActivity');

const activityTracker = (action) => async (req, res, next) => {
  const originalSend = res.json;
  res.json = function(data) {
    res.locals.responseData = data;
    originalSend.call(this, data);
  };

  try {
    // Wait for the route handler to complete
    await next();

    // Only track activity if the request was successful
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      await UserActivity.create({
        user: req.user._id,
        action,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: req.body,
          response: res.locals.responseData
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
    }
  } catch (error) {
    console.error('Error tracking activity:', error);
    next(error);
  }
};

module.exports = activityTracker; 