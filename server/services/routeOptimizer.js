const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Booking = require('../models/Booking');
const { subDays, addDays, differenceInMinutes } = require('date-fns');

class RouteOptimizer {
  constructor(socketService) {
    this.socketService = socketService;
    this.OPTIMIZATION_WEIGHTS = {
      demand: 0.4,
      revenue: 0.3,
      distance: 0.2,
      timing: 0.1
    };
  }

  async optimizeRoutes() {
    const routes = await Route.find({ status: 'active' });
    const optimizationResults = [];

    for (const route of routes) {
      const analysis = await this.analyzeRoute(route);
      const recommendations = await this.generateRecommendations(analysis);
      
      optimizationResults.push({
        routeId: route._id,
        currentMetrics: analysis,
        recommendations,
        potentialImpact: this.calculatePotentialImpact(analysis, recommendations)
      });
    }

    return optimizationResults;
  }

  async analyzeRoute(route) {
    const [demandAnalysis, revenueAnalysis, performanceMetrics] = await Promise.all([
      this.analyzeDemand(route._id),
      this.analyzeRevenue(route._id),
      this.analyzePerformanceMetrics(route._id)
    ]);

    return {
      demand: demandAnalysis,
      revenue: revenueAnalysis,
      performance: performanceMetrics
    };
  }

  async analyzeDemand(routeId) {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const demandData = await Booking.aggregate([
      {
        $match: {
          route: routeId,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            dayOfWeek: { $dayOfWeek: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.dayOfWeek',
          hourlyDemand: {
            $push: {
              hour: '$_id.hour',
              count: '$count'
            }
          },
          totalDemand: { $sum: '$count' }
        }
      }
    ]);

    return this.processDemandData(demandData);
  }

  async analyzeRevenue(routeId) {
    const thirtyDaysAgo = subDays(new Date(), 30);

    return await Booking.aggregate([
      {
        $match: {
          route: routeId,
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          averageRevenue: { $avg: '$revenue' },
          totalRevenue: { $sum: '$revenue' },
          revenuePerBooking: {
            $avg: { $divide: ['$revenue', '$bookings'] }
          }
        }
      }
    ]);
  }

  async analyzePerformanceMetrics(routeId) {
    const schedules = await Schedule.find({
      route: routeId,
      status: 'completed'
    }).populate('bookings');

    return {
      occupancyRate: this.calculateOccupancyRate(schedules),
      onTimeRate: this.calculateOnTimeRate(schedules),
      costEfficiency: await this.calculateCostEfficiency(schedules)
    };
  }

  async generateRecommendations(analysis) {
    const recommendations = [];

    // Optimize departure times based on demand
    const optimalDepartureTimes = this.calculateOptimalDepartureTimes(analysis.demand);
    if (optimalDepartureTimes.length > 0) {
      recommendations.push({
        type: 'schedule_adjustment',
        description: 'Adjust departure times to match peak demand',
        changes: optimalDepartureTimes,
        impact: {
          revenue: '+15%',
          occupancy: '+20%'
        }
      });
    }

    // Optimize pricing based on demand and revenue
    const pricingRecommendations = this.generatePricingRecommendations(analysis);
    if (pricingRecommendations) {
      recommendations.push(pricingRecommendations);
    }

    // Optimize capacity
    const capacityRecommendation = this.generateCapacityRecommendation(analysis);
    if (capacityRecommendation) {
      recommendations.push(capacityRecommendation);
    }

    return recommendations;
  }

  calculateOptimalDepartureTimes(demandData) {
    const peakHours = this.identifyPeakHours(demandData);
    const currentSchedule = this.getCurrentSchedule();
    const recommendations = [];

    peakHours.forEach(peak => {
      const nearestDeparture = this.findNearestDeparture(currentSchedule, peak.hour);
      if (Math.abs(nearestDeparture - peak.hour) > 1) {
        recommendations.push({
          currentTime: nearestDeparture,
          proposedTime: peak.hour,
          demandIncrease: peak.demand
        });
      }
    });

    return recommendations;
  }

  generatePricingRecommendations(analysis) {
    const { demand, revenue } = analysis;
    
    // Calculate price elasticity
    const elasticity = this.calculatePriceElasticity(demand, revenue);
    
    if (Math.abs(elasticity) > 1) {
      return {
        type: 'dynamic_pricing',
        description: 'Implement dynamic pricing based on demand patterns',
        changes: {
          peakHours: '+15%',
          offPeakHours: '-10%'
        },
        impact: {
          revenue: '+20%',
          demandBalance: '+25%'
        }
      };
    }

    return null;
  }

  generateCapacityRecommendation(analysis) {
    const { performance } = analysis;
    
    if (performance.occupancyRate > 85) {
      return {
        type: 'capacity_increase',
        description: 'Increase capacity during peak hours',
        changes: {
          additionalBuses: 1,
          targetHours: 'Peak demand periods'
        },
        impact: {
          revenue: '+25%',
          serviceQuality: '+15%'
        }
      };
    }

    if (performance.occupancyRate < 40) {
      return {
        type: 'capacity_decrease',
        description: 'Optimize capacity by using smaller vehicles during off-peak hours',
        changes: {
          vehicleSize: 'Medium to Small',
          targetHours: 'Off-peak periods'
        },
        impact: {
          costReduction: '30%',
          efficiency: '+20%'
        }
      };
    }

    return null;
  }

  calculatePotentialImpact(analysis, recommendations) {
    let revenueImpact = 0;
    let efficiencyImpact = 0;
    let costImpact = 0;

    recommendations.forEach(rec => {
      if (rec.impact.revenue) {
        revenueImpact += parseFloat(rec.impact.revenue);
      }
      if (rec.impact.efficiency) {
        efficiencyImpact += parseFloat(rec.impact.efficiency);
      }
      if (rec.impact.costReduction) {
        costImpact += parseFloat(rec.impact.costReduction);
      }
    });

    return {
      revenueIncrease: revenueImpact,
      efficiencyImprovement: efficiencyImpact,
      costReduction: costImpact,
      roi: this.calculateROI(revenueImpact, costImpact)
    };
  }

  // Helper methods
  calculateOccupancyRate(schedules) {
    if (schedules.length === 0) return 0;
    
    const totalOccupancy = schedules.reduce((sum, schedule) => {
      const occupancy = (schedule.bookings.length / schedule.availableSeats) * 100;
      return sum + occupancy;
    }, 0);

    return totalOccupancy / schedules.length;
  }

  calculateOnTimeRate(schedules) {
    if (schedules.length === 0) return 0;
    
    const onTimeSchedules = schedules.filter(schedule => 
      new Date(schedule.actualArrivalTime) <= new Date(schedule.estimatedArrivalTime)
    ).length;

    return (onTimeSchedules / schedules.length) * 100;
  }

  async calculateCostEfficiency(schedules) {
    // Implementation for cost efficiency calculation
    return 0;
  }

  calculateROI(revenueIncrease, costReduction) {
    const totalBenefit = revenueIncrease + costReduction;
    const implementationCost = this.estimateImplementationCost();
    return (totalBenefit - implementationCost) / implementationCost * 100;
  }

  estimateImplementationCost() {
    // Implementation for cost estimation
    return 1000;
  }
}

module.exports = RouteOptimizer; 