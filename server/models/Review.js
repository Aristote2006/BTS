const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'flagged'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Prevent multiple reviews from same user for same booking
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });

// Calculate average rating for driver
reviewSchema.statics.getAverageRating = async function(driverId) {
  const stats = await this.aggregate([
    {
      $match: { driver: driverId, status: 'active' }
    },
    {
      $group: {
        _id: '$driver',
        averageRating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Driver').findByIdAndUpdate(driverId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      numberOfReviews: stats[0].numberOfReviews
    });
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.driver);
});

// Call getAverageRating before remove
reviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.driver);
});

module.exports = mongoose.model('Review', reviewSchema); 