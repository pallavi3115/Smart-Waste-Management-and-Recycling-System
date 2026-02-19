const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const setupSocket = (socketIO) => {
  io = socketIO;

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name}`);

    // Join user-specific room
    socket.join(`user:${socket.user.id}`);

    // Join role-specific room
    socket.join(`role:${socket.user.role}`);

    // Join location-based room (if available)
    if (socket.user.location && socket.user.location.coordinates) {
      const [lng, lat] = socket.user.location.coordinates;
      // Simplified: join zone room
      socket.join(`zone:${Math.floor(lat)},${Math.floor(lng)}`);
    }

    // Handle bin status updates
    socket.on('binUpdate', (data) => {
      // Broadcast to relevant rooms
      io.to('role:Admin').emit('binStatusChange', data);
      io.to('role:Driver').emit('binStatusChange', data);
    });

    // Handle new reports
    socket.on('newReport', (data) => {
      // Notify nearby admins
      io.to(`zone:${data.zone}`).emit('reportAlert', data);
    });

    // Handle chat messages
    socket.on('sendMessage', (data) => {
      const { to, message } = data;
      io.to(`user:${to}`).emit('receiveMessage', {
        from: socket.user.id,
        fromName: socket.user.name,
        message,
        timestamp: new Date()
      });
    });

    // Handle location updates
    socket.on('updateLocation', (data) => {
      socket.user.location = {
        type: 'Point',
        coordinates: [data.lng, data.lat]
      };
      
      // Update rooms based on new location
      // ... implement zone change logic
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
      
      // Notify admins
      io.to('role:Admin').emit('userOffline', {
        userId: socket.user.id,
        name: socket.user.name
      });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit functions
const emitBinAlert = (binData) => {
  io.emit('binAlert', binData);
};

const emitReportUpdate = (reportId, status) => {
  io.to(`report:${reportId}`).emit('reportUpdate', { reportId, status });
};

const emitNotification = (userId, notification) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

const emitLeaderboardUpdate = () => {
  io.emit('leaderboardUpdate');
};

module.exports = {
  setupSocket,
  getIO,
  emitBinAlert,
  emitReportUpdate,
  emitNotification,
  emitLeaderboardUpdate
};