const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// ================= ROUTES =================
const authRoutes = require('./routes/auth');
const binRoutes = require('./routes/bins');
const recyclingRoutes = require('./routes/recycling');
const reportRoutes = require('./routes/reports');
const rewardRoutes = require('./routes/rewards');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const qrRoutes = require('./routes/qr');
const mapRoutes = require('./routes/map');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');

const analyticsRoutes = require('./routes/analytics');
const staffRoutes = require('./routes/staffRoutes');
const auditRoutes = require('./routes/audit'); // ✅ AUDIT LOG ADDED

const driverRoutes = require('./routes/driver');
const driverRouteRoutes = require('./routes/routes');
const attendanceRoutes = require('./routes/attendance');

// ================= APP =================
const app = express();
const httpServer = createServer(app);

// ================= SOCKET =================
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.set('io', io);

// ================= DB =================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB error:', error);
    process.exit(1);
  }
};

if (process.env.MONGODB_URI) connectDB();
else console.warn('⚠️ MONGODB_URI missing');

// ================= MIDDLEWARE =================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(compression());
app.use(morgan('dev'));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ================= HEALTH =================
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server running 🚀' });
});

// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/bins', binRoutes);
app.use('/api/recycling', recyclingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

app.use('/api/users/staff', staffRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditRoutes); // ✅ FINAL AUDIT ROUTE

// DRIVER ROUTES
try {
  app.use('/api/driver', driverRoutes);
  app.use('/api/driver/routes', driverRouteRoutes);
  app.use('/api/driver/attendance', attendanceRoutes);
} catch (err) {
  console.warn('Driver routes error:', err.message);
}

// ================= ROOT =================
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Waste Management API',
    status: 'running'
  });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ================= ERROR =================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message
  });
});

// ================= SOCKET =================
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('driver-location', (data) => {
    socket.broadcast.emit('driver-location-update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;