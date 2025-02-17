const Booking = require('../models/Booking');
const Route = require('../models/Route');
const { generateTicketNumber } = require('../utils/helpers');
const PaymentService = require('../services/payment');

// Get active bookings for a user
exports.getActiveBookings = async (req, res) => {
  try {
    const activeBookings = await Booking.find({
      user: req.user._id,
      status: { $in: ['pending', 'confirmed'] },
      travelDate: { $gte: new Date() }
    })
    .populate('route')
    .sort('-createdAt');

    res.json({
      success: true,
      data: activeBookings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get past bookings for a user
exports.getPastBookings = async (req, res) => {
  try {
    const pastBookings = await Booking.find({
      user: req.user._id,
      $or: [
        { status: 'completed' },
        { travelDate: { $lt: new Date() } }
      ]
    })
    .populate('route')
    .sort('-travelDate')
    .limit(10);

    res.json({
      success: true,
      data: pastBookings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { routeId, seats, travelDate } = req.body;

    // Check if route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check seat availability
    const existingBookings = await Booking.find({
      route: routeId,
      travelDate,
      status: { $in: ['pending', 'confirmed'] },
      seats: { $in: seats }
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some selected seats are already booked'
      });
    }

    // Calculate total amount
    const totalAmount = route.price * seats.length;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      route: routeId,
      seats,
      travelDate,
      totalAmount,
      ticketNumber: generateTicketNumber(),
      status: 'pending'
    });

    // Initialize payment
    const paymentData = {
      amount: totalAmount,
      email: req.user.email,
      reference: booking.ticketNumber
    };

    const paymentInit = await PaymentService.initializePayment(paymentData);

    res.status(201).json({
      success: true,
      data: {
        booking,
        paymentUrl: paymentInit.data.link
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('route');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('route')
      .sort('-createdAt');

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('route')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow updates if booking is pending
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update confirmed booking' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('route');

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow cancellation if booking is pending or confirmed
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 