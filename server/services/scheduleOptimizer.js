const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');

class ScheduleOptimizer {
  async optimizeSchedule(routeId, startDate, endDate) {
    try {
      // Get historical booking data
      const historicalData = await this.getHistoricalData(routeId);
      
      // Analyze peak hours
      const peakHours = this.analyzePeakHours(historicalData);
      
      // Calculate optimal departure times
      const recommendedTimes = this.calculateOptimalDepartureTimes(peakHours);
      
      // Calculate fleet size
      const recommendedFleetSize = this.calculateOptimalFleetSize(
        historicalData,
        recommendedTimes
      );
      
      // Project occupancy
      const expectedOccupancy = this.projectOccupancy(
        historicalData,
        recommendedTimes
      );
      
      // Calculate efficiency score
      const efficiencyScore = this.calculateEfficiencyScore(
        recommendedTimes,
        expectedOccupancy,
        recommendedFleetSize
      );

      return {
        recommendedTimes,
        expectedOccupancy,
        recommendedFleetSize,
        efficiencyScore,
        peakHours,
      };
    } catch (error) {
      throw new Error(`Optimization failed: ${error.message}`);
    }
  }

  async getHistoricalData(routeId) {
    const threeMothsAgo = new Date();
    threeMothsAgo.setMonth(threeMothsAgo.getMonth() - 3);

    return await Booking.aggregate([
      {
        $match: {
          route: routeId,
          createdAt: { $gte: threeMothsAgo },
          status: 'confirmed'
        }
      },
      {
        $lookup: {
          from: 'schedules',
          localField: 'schedule',
          foreignField: '_id',
          as: 'scheduleDetails'
        }
      },
      { $unwind: '$scheduleDetails' },
      {
        $group: {
          _id: {
            hour: { $hour: '$scheduleDetails.departureTime' },
            dayOfWeek: { $dayOfWeek: '$scheduleDetails.date' }
          },
          bookings: { $sum: 1 },
          averageOccupancy: { $avg: '$scheduleDetails.occupancyRate' }
        }
      }
    ]);
  }

  analyzePeakHours(historicalData) {
    // Group data by hour and calculate average bookings
    const hourlyAverages = historicalData.reduce((acc, curr) => {
      const hour = curr._id.hour;
      if (!acc[hour]) {
        acc[hour] = {
          totalBookings: 0,
          count: 0
        };
      }
      acc[hour].totalBookings += curr.bookings;
      acc[hour].count += 1;
      return acc;
    }, {});

    // Calculate peak hours (hours with above-average bookings)
    const average = Object.values(hourlyAverages).reduce(
      (acc, curr) => acc + (curr.totalBookings / curr.count),
      0
    ) / Object.keys(hourlyAverages).length;

    return Object.entries(hourlyAverages)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        average: data.totalBookings / data.count,
        isPeak: (data.totalBookings / data.count) > average
      }))
      .sort((a, b) => b.average - a.average);
  }

  calculateOptimalDepartureTimes(peakHours) {
    // Calculate optimal departure times based on peak hours
    return peakHours
      .filter(hour => hour.isPeak)
      .map(hour => {
        const baseTime = `${hour.hour.toString().padStart(2, '0')}:00`;
        // For peak hours, recommend multiple departures
        return hour.average > peakHours[0].average * 0.8
          ? [baseTime, `${hour.hour.toString().padStart(2, '0')}:30`]
          : [baseTime];
      })
      .flat()
      .sort();
  }

  calculateOptimalFleetSize(historicalData, recommendedTimes) {
    // Calculate based on peak demand and schedule overlap
    const peakDemand = Math.max(
      ...historicalData.map(data => data.bookings)
    );
    const averageTripduration = 2; // hours
    const overlapFactor = 1.2; // 20% buffer

    return Math.ceil(
      (peakDemand / 40) * // 40 is standard bus capacity
      (recommendedTimes.length / 24) * // schedule density
      averageTripduration *
      overlapFactor
    );
  }

  projectOccupancy(historicalData, recommendedTimes) {
    const averageOccupancy = historicalData.reduce(
      (acc, curr) => acc + curr.averageOccupancy,
      0
    ) / historicalData.length;

    // Project improved occupancy with optimized schedule
    return Math.min(
      Math.round(averageOccupancy * 1.2 * 100), // 20% improvement
      95 // Cap at 95%
    );
  }

  calculateEfficiencyScore(recommendedTimes, expectedOccupancy, fleetSize) {
    // Score from 0-100 based on various factors
    const coverageScore = Math.min(recommendedTimes.length / 12, 1) * 30;
    const occupancyScore = (expectedOccupancy / 100) * 40;
    const fleetScore = Math.min(1 / (fleetSize / recommendedTimes.length), 1) * 30;

    return Math.round(coverageScore + occupancyScore + fleetScore);
  }
}

module.exports = new ScheduleOptimizer(); 