const Driver = require('../models/Driver');
const Schedule = require('../models/Schedule');
const Review = require('../models/Review');

class RewardService {
  constructor(socketService) {
    this.socketService = socketService;
    this.pointRules = {
      onTimeCompletion: 10,
      perfectAttendance: 50,
      highRating: 20,
      streak: 5,
      achievement: 100
    };
  }

  async processScheduleCompletion(schedule) {
    const points = await this.calculateSchedulePoints(schedule);
    if (points > 0) {
      await this.awardPoints(schedule.driverId, points, 'schedule_completion');
    }

    await this.checkAchievements(schedule.driverId);
  }

  async processRating(review) {
    if (review.rating >= 4.5) {
      await this.awardPoints(
        review.driverId,
        this.pointRules.highRating,
        'high_rating'
      );
    }
  }

  async calculateSchedulePoints(schedule) {
    let points = 0;

    // On-time completion bonus
    if (new Date(schedule.actualArrivalTime) <= new Date(schedule.estimatedArrivalTime)) {
      points += this.pointRules.onTimeCompletion;
    }

    // Streak bonus
    const streak = await this.calculateStreak(schedule.driverId);
    points += streak * this.pointRules.streak;

    return points;
  }

  async awardPoints(driverId, points, reason) {
    const driver = await Driver.findById(driverId);
    const previousLevel = Math.floor(driver.stats.points / 100);
    
    driver.stats.points += points;
    await driver.save();

    const currentLevel = Math.floor(driver.stats.points / 100);
    
    // Level up notification
    if (currentLevel > previousLevel) {
      this.socketService.emitNotification({
        userId: driverId,
        type: 'reward',
        title: 'Level Up!',
        message: `Congratulations! You've reached Level ${currentLevel}`,
        data: { level: currentLevel }
      });
    }

    // Points notification
    this.socketService.emitNotification({
      userId: driverId,
      type: 'reward',
      title: 'Points Earned',
      message: `You've earned ${points} points!`,
      data: { points, reason }
    });
  }

  async calculateStreak(driverId) {
    const schedules = await Schedule.find({
      driverId,
      status: 'completed',
      actualArrivalTime: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }).sort({ actualArrivalTime: -1 });

    let streak = 0;
    let currentDate = new Date();
    
    for (const schedule of schedules) {
      const scheduleDate = new Date(schedule.date);
      if (
        scheduleDate.getDate() === currentDate.getDate() - 1 &&
        new Date(schedule.actualArrivalTime) <= new Date(schedule.estimatedArrivalTime)
      ) {
        streak++;
        currentDate = scheduleDate;
      } else {
        break;
      }
    }

    return streak;
  }

  async checkAchievements(driverId) {
    const achievements = await this.calculateAchievements(driverId);
    const driver = await Driver.findById(driverId);
    
    for (const achievement of achievements) {
      if (!driver.achievements.includes(achievement.id)) {
        driver.achievements.push(achievement.id);
        await this.awardPoints(driverId, this.pointRules.achievement, 'achievement');
        
        this.socketService.emitNotification({
          userId: driverId,
          type: 'achievement',
          title: 'New Achievement Unlocked!',
          message: achievement.title,
          data: achievement
        });
      }
    }

    await driver.save();
  }

  async calculateAchievements(driverId) {
    const achievements = [];
    const stats = await this.getDriverStats(driverId);

    // Perfect Month
    if (stats.onTimeRate === 100 && stats.completedTrips >= 20) {
      achievements.push({
        id: 'perfect_month',
        title: 'Perfect Month',
        description: 'Complete 20+ trips with 100% on-time rate'
      });
    }

    // Top Rated
    if (stats.averageRating >= 4.8 && stats.totalRatings >= 50) {
      achievements.push({
        id: 'top_rated',
        title: 'Top Rated Driver',
        description: 'Maintain 4.8+ rating with 50+ reviews'
      });
    }

    // Marathon Driver
    if (stats.completedTrips >= 100) {
      achievements.push({
        id: 'marathon_driver',
        title: 'Marathon Driver',
        description: 'Complete 100 trips'
      });
    }

    return achievements;
  }

  async getDriverStats(driverId) {
    const [scheduleStats, ratingStats] = await Promise.all([
      Schedule.aggregate([
        {
          $match: {
            driverId: mongoose.Types.ObjectId(driverId),
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            completedTrips: { $sum: 1 },
            onTimeTrips: {
              $sum: {
                $cond: [
                  { $lte: ['$actualArrivalTime', '$estimatedArrivalTime'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      Review.aggregate([
        {
          $match: {
            driverId: mongoose.Types.ObjectId(driverId)
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalRatings: { $sum: 1 }
          }
        }
      ])
    ]);

    return {
      completedTrips: scheduleStats[0]?.completedTrips || 0,
      onTimeRate: scheduleStats[0]
        ? (scheduleStats[0].onTimeTrips / scheduleStats[0].completedTrips) * 100
        : 0,
      averageRating: ratingStats[0]?.averageRating || 0,
      totalRatings: ratingStats[0]?.totalRatings || 0
    };
  }
}

module.exports = RewardService; 