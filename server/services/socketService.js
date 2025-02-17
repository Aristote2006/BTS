const socketIo = require('socket.io');

class SocketService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    this.connectedUsers = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('authenticate', (userId) => {
        this.connectedUsers.set(userId, socket.id);
        socket.userId = userId;
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });

      socket.on('join-route', (routeId) => {
        socket.join(`route-${routeId}`);
      });

      socket.on('leave-route', (routeId) => {
        socket.leave(`route-${routeId}`);
      });

      socket.on('update-location', (data) => {
        this.io.to(`route-${data.routeId}`).emit('location-update', {
          routeId: data.routeId,
          location: data.location,
          timestamp: new Date()
        });
      });
    });
  }

  emitNotification(data) {
    const { userId, type, title, message, data: payload } = data;
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      this.io.to(socketId).emit('notification', {
        type,
        title,
        message,
        data: payload,
        timestamp: new Date()
      });
    }
  }

  emitScheduleUpdate(userId, scheduleData) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('scheduleUpdate', scheduleData);
    }
  }

  emitReviewUpdate(userId, reviewData) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('reviewUpdate', reviewData);
    }
  }

  emitRewardUpdate(userId, rewardData) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('rewardUpdate', rewardData);
    }
  }

  broadcastRouteUpdate(routeData) {
    this.io.emit('routeUpdate', routeData);
  }

  // Method to emit updates to specific routes
  emitRouteUpdate(routeId, updateType, data) {
    this.io.to(`route-${routeId}`).emit(updateType, data);
  }

  // Method to emit global notifications
  emitNotification(userId, notification) {
    this.io.to(`user-${userId}`).emit('notification', notification);
  }
}

module.exports = SocketService; 