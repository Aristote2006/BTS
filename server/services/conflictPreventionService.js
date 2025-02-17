const Schedule = require('../models/Schedule');
const Driver = require('../models/Driver');
const Route = require('../models/Route');
const { subDays, addDays, isSameDay } = require('date-fns');

class ConflictPreventionService {
  constructor(socketService) {
    this.socketService = socketService;
  }

  async analyzeRisks() {
    const [highRisk, mediumRisk] = await Promise.all([
      this.identifyHighRiskSchedules(),
      this.identifyMediumRiskSchedules()
    ]);

    const patterns = await this.identifyRiskPatterns();
    const metrics = await this.calculatePreventionMetrics();
    const recommendations = await this.generateRecommendations(
      highRisk,
      mediumRisk,
      patterns
    );

    return {
      highRisk,
      mediumRisk,
      patterns,
      metrics,
      recommendations
    };
  }

  async identifyHighRiskSchedules() {
    const schedules = await Schedule.find({
      date: { $gte: new Date() },
      status: 'scheduled'
    }).populate('route driverId');

    return schedules.filter(schedule => {
      const riskFactors = [];

      // Check for tight connections
      if (this.hasTightConnection(schedule)) {
        riskFactors.push('tight_connection');
      }

      // Check for driver fatigue risk
      if (this.hasDriverFatigueRisk(schedule)) {
        riskFactors.push('driver_fatigue');
      }

      // Check for historical conflict patterns
      if (this.hasHistoricalConflicts(schedule)) {
        riskFactors.push('historical_conflicts');
      }

      return riskFactors.length >= 2;
    });
  }

  async identifyMediumRiskSchedules() {
    // Similar to high risk but with more lenient criteria
    const schedules = await Schedule.find({
      date: { $gte: new Date() },
      status: 'scheduled'
    }).populate('route driverId');

    return schedules.filter(schedule => {
      const riskFactors = [];

      if (this.hasTightConnection(schedule)) {
        riskFactors.push('tight_connection');
      }

      if (this.hasDriverFatigueRisk(schedule)) {
        riskFactors.push('driver_fatigue');
      }

      return riskFactors.length === 1;
    });
  }

  async identifyRiskPatterns() {
    const patterns = [];
    
    // Analyze driver workload patterns
    const driverWorkloadPattern = await this.analyzeDriverWorkloadPattern();
    if (driverWorkloadPattern) {
      patterns.push(driverWorkloadPattern);
    }

    // Analyze route timing patterns
    const routeTimingPattern = await this.analyzeRouteTimingPattern();
    if (routeTimingPattern) {
      patterns.push(routeTimingPattern);
    }

    // Analyze seasonal patterns
    const seasonalPattern = await this.analyzeSeasonalPattern();
    if (seasonalPattern) {
      patterns.push(seasonalPattern);
    }

    return patterns;
  }

  async analyzeDriverWorkloadPattern() {
    const overworkedDrivers = await Driver.aggregate([
      {
        $lookup: {
          from: 'schedules',
          localField: '_id',
          foreignField: 'driverId',
          as: 'schedules'
        }
      },
      {
        $project: {
          name: 1,
          scheduleCount: { $size: '$schedules' },
          consecutiveDays: {
            $size: {
              $setUnion: '$schedules.date'
            }
          }
        }
      },
      {
        $match: {
          scheduleCount: { $gt: 8 }, // More than 8 schedules
          consecutiveDays: { $gt: 5 } // More than 5 consecutive days
        }
      }
    ]);

    if (overworkedDrivers.length > 0) {
      return {
        type: 'Driver Workload Risk',
        impact: 'High',
        description: 'Multiple drivers with high workload and consecutive days',
        affectedDrivers: overworkedDrivers,
        recommendedAction: 'redistribute_workload'
      };
    }

    return null;
  }

  async analyzeRouteTimingPattern() {
    const routeDelays = await Schedule.aggregate([
      {
        $match: {
          status: 'completed',
          actualArrivalTime: { $exists: true }
        }
      },
      {
        $project: {
          route: 1,
          delay: {
            $subtract: ['$actualArrivalTime', '$estimatedArrivalTime']
          }
        }
      },
      {
        $group: {
          _id: '$route',
          averageDelay: { $avg: '$delay' },
          delayCount: {
            $sum: { $cond: [{ $gt: ['$delay', 0] }, 1, 0] }
          }
        }
      },
      {
        $match: {
          averageDelay: { $gt: 15 * 60 * 1000 }, // More than 15 minutes average delay
          delayCount: { $gt: 5 } // More than 5 delayed trips
        }
      }
    ]);

    if (routeDelays.length > 0) {
      return {
        type: 'Route Timing Risk',
        impact: 'Medium',
        description: 'Consistent delays on specific routes',
        affectedRoutes: routeDelays,
        recommendedAction: 'adjust_route_timing'
      };
    }

    return null;
  }

  async calculatePreventionMetrics() {
    const totalSchedules = await Schedule.countDocuments({
      date: { $gte: subDays(new Date(), 30) }
    });

    const conflictedSchedules = await Schedule.countDocuments({
      date: { $gte: subDays(new Date(), 30) },
      hasConflict: true
    });

    return {
      preventionRate: totalSchedules > 0
        ? ((totalSchedules - conflictedSchedules) / totalSchedules) * 100
        : 100,
      highRiskCount: (await this.identifyHighRiskSchedules()).length,
      mediumRiskCount: (await this.identifyMediumRiskSchedules()).length
    };
  }

  async generateRecommendations(highRisk, mediumRisk, patterns) {
    const recommendations = [];

    // Add recommendations based on risk levels and patterns
    if (highRisk.length > 0) {
      recommendations.push({
        priority: 'High',
        title: 'Immediate Schedule Adjustment Needed',
        description: `${highRisk.length} schedules at high risk of conflict`,
        action: 'review_high_risk'
      });
    }

    // Add pattern-based recommendations
    patterns.forEach(pattern => {
      recommendations.push({
        priority: pattern.impact === 'High' ? 'High' : 'Medium',
        title: `Address ${pattern.type}`,
        description: pattern.description,
        action: pattern.recommendedAction
      });
    });

    return recommendations;
  }

  // Helper methods
  hasTightConnection(schedule) {
    // Implementation for checking tight connections
    return false;
  }

  hasDriverFatigueRisk(schedule) {
    // Implementation for checking driver fatigue risk
    return false;
  }

  hasHistoricalConflicts(schedule) {
    // Implementation for checking historical conflicts
    return false;
  }
}

module.exports = ConflictPreventionService; 