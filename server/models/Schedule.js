const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  busNumber: {
    type: String,
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true,
    default: 40
  },
  status: {
    type: String,
    enum: ['scheduled', 'inProgress', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema); 