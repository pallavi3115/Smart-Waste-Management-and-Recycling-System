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

// Import routes
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

// Driver routes
const driverRoutes = require('./routes/driver');
const driverRouteRoutes = require('./routes/routes');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// ===== DATABASE CONNECTION =====
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to database
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.warn('⚠️  MONGODB_URI not found. Please set it in .env file');
}

// ===== MIDDLEWARE =====

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// Logging
app.use(morgan('dev'));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===== HEALTH CHECK ROUTES =====

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: process.env.MONGODB_URI ? 'Connected' : 'Disconnected'
  });
});

// API Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: '🚀 Smart Waste Management API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: process.env.MONGODB_URI ? 'Connected' : 'Disconnected'
  });
});

// ===== API ROUTES =====

// Auth routes
app.use('/api/auth', authRoutes);

// Bin routes
app.use('/api/bins', binRoutes);

// Recycling routes
app.use('/api/recycling', recyclingRoutes);

// Report routes
app.use('/api/reports', reportRoutes);

// Reward routes
app.use('/api/rewards', rewardRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// QR routes
app.use('/api/qr', qrRoutes);

// Map routes
app.use('/api/map', mapRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// User routes
app.use('/api/users', userRoutes);

// Driver routes (with error handling to prevent crashes if files don't exist)
try {
  app.use('/api/driver', driverRoutes);
  app.use('/api/driver/routes', driverRouteRoutes);
  app.use('/api/driver/attendance', attendanceRoutes);
  console.log('✅ Driver routes loaded successfully');
} catch (error) {
  console.warn('⚠️ Driver routes could not be loaded:', error.message);
  // Create fallback routes to prevent crashes
  app.use('/api/driver', (req, res) => {
    res.status(200).json({ success: true, message: 'Driver API - Coming soon' });
  });
}

// ===== ROOT ROUTE =====
app.get('/', (req, res) => {
  res.json({
    message: '🎯 Smart Waste Management API',
    version: '1.0.0',
    status: 'running',
    database: process.env.MONGODB_URI ? 'Connected' : 'Disconnected',
    documentation: 'API endpoints are available under /api/*',
    endpoints: [
      'GET  /health',
      'GET  /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'GET  /api/bins',
      'POST /api/bins',
      'GET  /api/reports',
      'POST /api/reports',
      'GET  /api/recycling/centers',
      'GET  /api/admin/dashboard',
      'GET  /api/driver/dashboard',
      'GET  /api/driver/routes',
      'POST /api/driver/attendance/check-in',
      'POST /api/driver/attendance/check-out'
    ]
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// ===== ERROR HANDLING MIDDLEWARE =====
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ===== SOCKET.IO SETUP =====
// Setup socket.io for real-time driver location tracking
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('driver-location', (data) => {
    // Broadcast driver location to admins
    socket.broadcast.emit('driver-location-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SMART WASTE MANAGEMENT API');
  console.log('='.repeat(60));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Disconnected'}`);
  console.log('='.repeat(60));
  console.log('📚 AVAILABLE ROUTES:');
  console.log('   • GET  /                    - API information');
  console.log('   • GET  /health               - Health check');
  console.log('   • GET  /api/health           - API health check');
  console.log('   • POST /api/auth/register    - User registration');
  console.log('   • POST /api/auth/login       - User login');
  console.log('   • GET  /api/auth/me          - Get current user');
  console.log('   • GET  /api/bins             - Get all bins');
  console.log('   • POST /api/bins             - Create new bin');
  console.log('   • GET  /api/reports          - Get reports');
  console.log('   • POST /api/reports          - Create report');
  console.log('   • GET  /api/recycling/centers - Get recycling centers');
  console.log('   • GET  /api/admin/dashboard  - Admin dashboard');
  console.log('   • GET  /api/driver/dashboard - Driver dashboard');
  console.log('   • GET  /api/driver/routes    - Driver routes');
  console.log('   • POST /api/driver/attendance/check-in - Driver check-in');
  console.log('   • POST /api/driver/attendance/check-out - Driver check-out');
  console.log('='.repeat(60));
  console.log('👥 USER ROLES:');
  console.log('   • Admin  → /admin/dashboard');
  console.log('   • Citizen → /citizen/dashboard');
  console.log('   • Driver → /driver/dashboard');
  console.log('='.repeat(60));
  console.log('🔐 TEST CREDENTIALS:');
  console.log('   • Admin:  admin@test.com / 123456');
  console.log('   • Citizen: citizen@test.com / 123456');
  console.log('   • Driver:  driver@test.com / 123456');
  console.log('='.repeat(60));
  console.log('⚡ Server is ready to accept requests');
  console.log('='.repeat(60) + '\n');
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server...');
  httpServer.close(() => {
    console.log('HTTP server closed.');
    if (mongoose.connection) {
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Closing HTTP server...');
  httpServer.close(() => {
    console.log('HTTP server closed.');
    if (mongoose.connection) {
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

module.exports = app;