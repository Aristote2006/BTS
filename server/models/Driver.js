const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  experience: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'on_trip', 'on_leave', 'inactive'],
    default: 'available'
  },
  stats: {
    totalTrips: {
      type: Number,
      default: 0
    },
    onTimeRate: {
      type: Number,
      default: 100
    },
    rating: {
      type: Number,
      default: 5
    },
    completedTrips: {
      type: Number,
      default: 0
    },
    cancelledTrips: {
      type: Number,
      default: 0
    }
  },
  documents: {
    license: String,
    insurance: String,
    medicalCertificate: String
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  }
}, {
  timestamps: true
});

driverSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema); 