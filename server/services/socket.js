const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
      }
    });

    this.io.use((socket, next) => {
      if (socket.handshake.auth && socket.handshake.auth.token) {
        jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) return next(new Error('Authentication error'));
          socket.user = decoded;
          next();
        });
      } else {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.user.id);
      
      // Join user-specific room
      socket.join(`user:${socket.user.id}`);
      
      // Join role-specific room
      socket.join(`role:${socket.user.role}`);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.user.id);
      });
    });
  }

  // Emit booking updates to relevant users
  emitBookingUpdate(booking) {
    // Notify the customer
    this.io.to(`user:${booking.user}`).emit('bookingUpdate', {
      type: 'update',
      booking
    });

    // Notify agency admins
    this.io.to(`role:admin`).emit('bookingUpdate', {
      type: 'new',
      booking
    });
  }

  // Emit seat availability updates
  emitSeatUpdate(routeId, availableSeats) {
    this.io.emit(`seatUpdate:${routeId}`, { availableSeats });
  }

  // Emit notifications
  emitNotification(notification) {
    if (notification.userId) {
      // Send to specific user
      this.io.to(`user:${notification.userId}`).emit('notification', notification);
    } else if (notification.role) {
      // Send to all users with specific role
      this.io.to(`role:${notification.role}`).emit('notification', notification);
    } else {
      // Broadcast to all authenticated users
      this.io.emit('notification', notification);
    }
  }

  emitAnalyticsUpdate(data) {
    this.io.to('role:admin').to('role:superadmin').emit('analyticsUpdate', data);
  }

  emitBookingAnalytics(data) {
    this.io.to('role:admin').to('role:superadmin').emit('bookingAnalytics', data);
  }

  emitRevenueUpdate(data) {
    this.io.to('role:admin').to('role:superadmin').emit('revenueUpdate', data);
  }

  emitRoutePerformance(data) {
    this.io.to('role:admin').to('role:superadmin').emit('routePerformance', data);
  }

  emitScheduleConflict(conflict) {
    this.io.to('role:admin').to('role:dispatcher').emit('scheduleConflict', conflict);
  }
}

module.exports = SocketService; 