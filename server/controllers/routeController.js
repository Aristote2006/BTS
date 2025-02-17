const Route = require('../models/Route');
const Agency = require('../models/Agency');

exports.createRoute = async (req, res) => {
  try {
    const { from, to, price, departureTime, agencyId } = req.body;

    // Verify agency exists
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    const route = await Route.create({
      from,
      to,
      price,
      departureTime,
      agency: agencyId
    });

    res.status(201).json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const { from, to, date, agencyId } = req.query;
    const query = {};

    if (from) query.from = from;
    if (to) query.to = to;
    if (agencyId) query.agency = agencyId;

    const routes = await Route.find(query)
      .populate('agency', 'name')
      .sort('departureTime');

    res.json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('agency', 'name');

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Check if there are any active bookings
    const activeBookings = await Booking.find({
      route: req.params.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete route with active bookings'
      });
    }

    await route.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.optimizeRoutes = async (req, res) => {
  try {
    const routeOptimizer = req.app.get('routeOptimizer');
    const optimizationResults = await routeOptimizer.optimizeRoutes();

    res.json({
      success: true,
      data: optimizationResults
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRouteAnalysis = async (req, res) => {
  try {
    const { routeId } = req.params;
    const routeOptimizer = req.app.get('routeOptimizer');
    
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const analysis = await routeOptimizer.analyzeRoute(route);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.applyOptimization = async (req, res) => {
  try {
    const { routeId, recommendations } = req.body;
    const routeOptimizer = req.app.get('routeOptimizer');
    
    // Apply the recommended optimizations
    const results = await Promise.all(
      recommendations.map(async rec => {
        switch (rec.type) {
          case 'schedule_adjustment':
            return await applyScheduleAdjustments(routeId, rec.changes);
          case 'dynamic_pricing':
            return await applyDynamicPricing(routeId, rec.changes);
          case 'capacity_adjustment':
            return await applyCapacityAdjustment(routeId, rec.changes);
          default:
            return null;
        }
      })
    );

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 