const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const scheduleOptimizer = require('../services/scheduleOptimizer');
const Driver = require('../models/Driver');
const { format } = require('date-fns');

exports.createSchedule = async (req, res) => {
  try {
    // Check for conflicts before creating schedule
    const conflicts = await Schedule.find({
      date: new Date(req.body.date),
      $or: [
        { driverId: req.body.driverId },
        { busNumber: req.body.busNumber }
      ],
      $and: [
        {
          $or: [
            {
              $and: [
                { departureTime: { $lte: req.body.estimatedArrivalTime } },
                { estimatedArrivalTime: { $gte: req.body.departureTime } }
              ]
            }
          ]
        }
      ]
    });

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Schedule conflicts detected',
        conflicts
      });
    }

    const schedule = await Schedule.create(req.body);
    
    // Emit socket event for real-time updates
    const socketService = req.app.get('socketService');
    socketService.emitScheduleUpdate(schedule);

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const { date, routeId, status } = req.query;
    const query = {};

    if (date) {
      query.date = new Date(date);
    }
    if (routeId) {
      query.route = routeId;
    }
    if (status) {
      query.status = status;
    }

    const schedules = await Schedule.find(query)
      .populate('route')
      .sort({ date: 1, departureTime: 1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('route');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if there are any bookings for this schedule
    const bookings = await Booking.find({
      schedule: req.params.id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (bookings.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete schedule with active bookings'
      });
    }

    await schedule.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateScheduleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'completed' && { actualArrivalTime: new Date() })
      },
      { new: true }
    ).populate('route');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Emit socket event for real-time updates
    const socketService = req.app.get('socketService');
    socketService.emitScheduleUpdate(schedule);

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSchedulesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const schedules = await Schedule.find(query)
      .populate('route')
      .sort({ date: 1, departureTime: 1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getScheduleConflicts = async (req, res) => {
  try {
    const { date, busNumber, driverId } = req.query;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const conflicts = await Schedule.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      $or: [
        { busNumber },
        { driverId }
      ]
    }).populate('route');

    res.json({
      success: true,
      data: conflicts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.optimizeSchedule = async (req, res) => {
  try {
    const { routeId, startDate, endDate } = req.body;
    
    const optimizationResults = await scheduleOptimizer.optimizeSchedule(
      routeId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: optimizationResults
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkScheduleConflicts = async (req, res) => {
  try {
    const { driverId, busNumber, date, startTime, endTime } = req.body;
    
    // Convert times to Date objects
    const scheduleDate = new Date(date);
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    // Check for existing schedules in the time range
    const conflicts = await Schedule.find({
      date: scheduleDate,
      $or: [
        { driverId },
        { busNumber }
      ],
      $and: [
        {
          $or: [
            {
              // Check if new schedule overlaps with existing schedule
              $and: [
                { departureTime: { $lte: endTime } },
                { estimatedArrivalTime: { $gte: startTime } }
              ]
            }
          ]
        }
      ]
    }).populate('route');

    if (conflicts.length > 0) {
      // Emit conflict notification
      const socketService = req.app.get('socketService');
      const driver = await Driver.findById(driverId);
      
      conflicts.forEach(conflict => {
        socketService.emitScheduleConflict({
          driverId,
          driverName: driver.name,
          date: scheduleDate,
          conflictingSchedule: {
            route: conflict.route,
            departureTime: conflict.departureTime,
            estimatedArrivalTime: conflict.estimatedArrivalTime
          }
        });
      });

      return res.json({
        success: false,
        hasConflicts: true,
        data: conflicts
      });
    }

    res.json({
      success: true,
      hasConflicts: false,
      data: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConflictResolutionOptions = async (req, res) => {
  try {
    const conflict = await Schedule.findById(req.params.id).populate('route driverId');
    const date = new Date(conflict.date);
    
    // Find available drivers
    const availableDrivers = await Driver.find({
      _id: { $ne: conflict.driverId },
      status: 'available',
      // Add any other driver qualification criteria
    });

    // Find alternative schedules
    const alternativeSlots = await findAlternativeTimeSlots(conflict);
    
    // Generate resolution options
    const options = [
      // Driver reassignment options
      ...availableDrivers.map(driver => ({
        type: 'reassign',
        title: `Reassign to ${driver.name}`,
        description: `Reassign the schedule to ${driver.name} who is available and qualified for this route`,
        impactLevel: 'Low',
        action: {
          type: 'reassign_driver',
          driverId: driver._id
        }
      })),

      // Time slot adjustment options
      ...alternativeSlots.map(slot => ({
        type: 'reschedule',
        title: `Reschedule to ${format(slot.time, 'HH:mm')}`,
        description: `Move the schedule to an available time slot with minimal impact`,
        impactLevel: slot.impact,
        action: {
          type: 'reschedule',
          newTime: slot.time
        }
      })),

      // Schedule swap options
      ...(await generateSwapOptions(conflict))
    ];

    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resolveConflict = async (req, res) => {
  try {
    const { resolution } = req.body;
    const conflict = await Schedule.findById(req.params.id);

    switch (resolution.type) {
      case 'reassign_driver':
        await Schedule.findByIdAndUpdate(conflict._id, {
          driverId: resolution.driverId
        });
        break;

      case 'reschedule':
        await Schedule.findByIdAndUpdate(conflict._id, {
          departureTime: resolution.newTime,
          estimatedArrivalTime: calculateNewArrivalTime(resolution.newTime, conflict.route)
        });
        break;

      case 'swap':
        await swapSchedules(conflict._id, resolution.targetScheduleId);
        break;
    }

    // Emit update via socket
    const socketService = req.app.get('socketService');
    socketService.emitScheduleUpdate({
      type: 'conflict_resolved',
      scheduleId: conflict._id
    });

    res.json({
      success: true,
      message: 'Conflict resolved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper functions
const findAlternativeTimeSlots = async (conflict) => {
  const date = new Date(conflict.date);
  const slots = [];
  
  // Check slots before and after the conflicting time
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    
    const time = new Date(conflict.departureTime);
    time.setHours(time.getHours() + i);
    
    const hasConflict = await Schedule.findOne({
      date,
      $or: [
        { driverId: conflict.driverId },
        { busNumber: conflict.busNumber }
      ],
      departureTime: {
        $gte: subHours(time, 1),
        $lte: addHours(time, 1)
      }
    });

    if (!hasConflict) {
      slots.push({
        time,
        impact: Math.abs(i) <= 1 ? 'Low' : Math.abs(i) <= 2 ? 'Medium' : 'High'
      });
    }
  }
  
  return slots;
};

const generateSwapOptions = async (conflict) => {
  const date = new Date(conflict.date);
  const swappableSchedules = await Schedule.find({
    date,
    _id: { $ne: conflict._id },
    status: 'scheduled'
  }).populate('route driverId');

  return swappableSchedules.map(schedule => ({
    type: 'swap',
    title: `Swap with ${schedule.driverId.name}'s schedule`,
    description: `Swap schedules with route ${schedule.route.from} → ${schedule.route.to}`,
    impactLevel: 'Medium',
    action: {
      type: 'swap',
      targetScheduleId: schedule._id
    }
  }));
};

const swapSchedules = async (schedule1Id, schedule2Id) => {
  const [schedule1, schedule2] = await Promise.all([
    Schedule.findById(schedule1Id),
    Schedule.findById(schedule2Id)
  ]);

  await Promise.all([
    Schedule.findByIdAndUpdate(schedule1Id, {
      driverId: schedule2.driverId,
      busNumber: schedule2.busNumber
    }),
    Schedule.findByIdAndUpdate(schedule2Id, {
      driverId: schedule1.driverId,
      busNumber: schedule1.busNumber
    })
  ]);
};

exports.getOptimizationMetrics = async (req, res) => {
  try {
    const metrics = await req.app.get('realTimeOptimizer').calculateCurrentMetrics();
    const recommendations = await req.app.get('realTimeOptimizer').generateRecommendations(metrics);

    res.json({
      success: true,
      data: {
        ...metrics,
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.startRealTimeOptimization = async (req, res) => {
  try {
    req.app.get('realTimeOptimizer').startOptimization();
    res.json({
      success: true,
      message: 'Real-time optimization started'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 