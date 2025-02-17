const crypto = require('crypto');

// Generate unique ticket number
exports.generateTicketNumber = () => {
  const prefix = 'TKT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Generate unique reference number for payments
exports.generateReferenceNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString().slice(2, 6);
  return `REF-${timestamp.slice(-6)}${random}`;
};

// Format currency amount
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF'
  }).format(amount);
};

// Calculate time difference in minutes
exports.getTimeDifference = (time1, time2) => {
  return Math.round((time2 - time1) / (1000 * 60));
};

// Generate random string
exports.generateRandomString = (length = 6) => {
  return crypto.randomBytes(length).toString('hex');
};

// Format date to local string
exports.formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-RW', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate distance between two coordinates in kilometers
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Convert degrees to radians
const toRad = (degrees) => {
  return degrees * Math.PI / 180;
};

// Validate phone number format
exports.validatePhoneNumber = (phone) => {
  const phoneRegex = /^(\+?250|0)?7[2389][0-9]{7}$/;
  return phoneRegex.test(phone);
};

// Validate email format
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate slug from string
exports.generateSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Parse pagination parameters
exports.parsePaginationParams = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    page,
    limit,
    startIndex,
    endIndex
  };
};

// Format error message
exports.formatErrorMessage = (error) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return messages.join(', ');
  }
  return error.message;
};

// Check if object is empty
exports.isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Deep clone object
exports.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Generate random number between min and max
exports.getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Format duration in minutes to hours and minutes
exports.formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}; 