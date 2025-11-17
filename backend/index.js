// const express = require('express');
// const dotenv = require('dotenv');
// const connectDB = require('./config/database');
// const cors = require('./config/cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');

// // Load env vars
// dotenv.config();

// // Connect to database
// connectDB();

// const app = express();

// // Security middleware
// app.use(helmet());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// // CORS
// app.use(cors);

// // Body parser
// app.use(express.json());

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/bins', require('./routes/bins'));
// app.use('/api/recycling', require('./routes/recycling'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/admin', require('./routes/admin'));

// // Health check
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'Server is running'
//   });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
// });



// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Simple request logger
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/bins', require('./routes/bins'));
// app.use('/api/recycling', require('./routes/recycling'));
// app.use('/api/admin', require('./routes/admin'));

// // Health check
// app.get('/api/health', (req, res) => {
//   res.status(200).json({ 
//     success: true, 
//     message: '🚀 Smart Waste Management Server is running!',
//     timestamp: new Date().toISOString(),
//     version: '1.0.0'
//   });
// });

// // Welcome route
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Welcome to Smart Waste Management API',
//     endpoints: {
//       auth: '/api/auth',
//       bins: '/api/bins',
//       recycling: '/api/recycling',
//       admin: '/api/admin',
//       health: '/api/health'
//     },
//     documentation: 'Check /api/health for server status'
//   });
// });

// // Handle undefined routes
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`
//   });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`
// 🌈 Smart Waste Management System
// 🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
// 📍 Port: ${PORT}
// 📚 API Documentation:
//    - Health: http://localhost:${PORT}/api/health
//    - Bins: http://localhost:${PORT}/api/bins/all
//    - Auth: http://localhost:${PORT}/api/auth/login
//    - Recycling: http://localhost:${PORT}/api/recycling/centers

// 💡 Try these test endpoints:
//    - GET  http://localhost:${PORT}/api/bins/all
//    - GET  http://localhost:${PORT}/api/recycling/centers
//    - POST http://localhost:${PORT}/api/auth/login
//      Body: {"email": "admin@test.com", "password": "123456"}
//   `);
// });



const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mock data
const bins = [
  {
    id: '1',
    location: { latitude: 28.6139, longitude: 77.2090 },
    fill_level: 45,
    fire_alert: false,
    status: 'Partial',
    area: 'Central Delhi',
    last_updated: new Date()
  },
  {
    id: '2', 
    location: { latitude: 28.5355, longitude: 77.3910 },
    fill_level: 92,
    fire_alert: false,
    status: 'Full',
    area: 'South Delhi',
    last_updated: new Date()
  },
  {
    id: '3',
    location: { latitude: 28.7041, longitude: 77.1025 },
    fill_level: 15,
    fire_alert: true,
    status: 'Empty',
    area: 'North Delhi',
    last_updated: new Date()
  }
];

const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@test.com',
    password: '123456',
    role: 'Admin'
  },
  {
    id: '2', 
    name: 'John Citizen',
    email: 'citizen@test.com',
    password: '123456',
    role: 'Citizen'
  }
];

const recyclingCenters = [
  {
    id: '1',
    name: 'Delhi Central Recycling Center',
    location: { latitude: 28.6129, longitude: 77.2295 },
    capacity: 1000,
    current_load: 650,
    materials_supported: ['Plastic', 'Glass', 'Paper', 'Metal'],
    contact_info: '+91 9876543210'
  },
  {
    id: '2',
    name: 'South Delhi Recycling Hub',
    location: { latitude: 28.5245, longitude: 77.2155 },
    capacity: 800,
    current_load: 320,
    materials_supported: ['Plastic', 'Paper'],
    contact_info: '+91 9876543211'
  }
];

// ===== ROUTES =====

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: '🚀 Smart Waste Management Server is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get all bins
app.get('/api/bins/all', (req, res) => {
  res.json({
    success: true,
    count: bins.length,
    data: bins
  });
});

// Get bin by ID
app.get('/api/bins/status/:id', (req, res) => {
  const bin = bins.find(b => b.id === req.params.id);
  if (!bin) {
    return res.status(404).json({ success: false, message: 'Bin not found' });
  }
  res.json({ success: true, data: bin });
});

// Update bin status (IoT)
app.post('/api/bins/update', (req, res) => {
  const { binId, fill_level, fire_alert, status } = req.body;
  const binIndex = bins.findIndex(b => b.id === binId);
  
  if (binIndex === -1) {
    return res.status(404).json({ success: false, message: 'Bin not found' });
  }

  bins[binIndex] = {
    ...bins[binIndex],
    fill_level,
    fire_alert,
    status,
    last_updated: new Date()
  };

  res.json({ success: true, data: bins[binIndex] });
});

// Get recycling centers
app.get('/api/recycling/centers', (req, res) => {
  res.json({
    success: true,
    count: recyclingCenters.length,
    data: recyclingCenters
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Simple token (in real app, use JWT)
  const token = 'mock-jwt-token-' + user.id;
  
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = users.find(user => user.email === email);
  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = {
    id: (users.length + 1).toString(),
    name,
    email,
    password,
    role: role || 'Citizen'
  };

  users.push(user);

  const token = 'mock-jwt-token-' + user.id;
  
  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

// Admin dashboard stats
app.get('/api/admin/dashboard', (req, res) => {
  const totalBins = bins.length;
  const fullBins = bins.filter(bin => bin.status === 'Full').length;
  const fireAlerts = bins.filter(bin => bin.fire_alert).length;
  
  res.json({
    success: true,
    data: {
      totalBins,
      fullBins,
      fireAlerts,
      recyclingRate: '68%',
      binsCollectedToday: 23,
      monthlyTrend: '+12%'
    }
  });
});

// Get recycling statistics
app.get('/api/recycling/stats', (req, res) => {
  const totalCapacity = recyclingCenters.reduce((sum, center) => sum + center.capacity, 0);
  const totalLoad = recyclingCenters.reduce((sum, center) => sum + center.current_load, 0);
  const utilizationRate = ((totalLoad / totalCapacity) * 100).toFixed(1);

  res.json({
    success: true,
    data: {
      totalCenters: recyclingCenters.length,
      totalCapacity,
      totalLoad,
      utilizationRate: utilizationRate + '%',
      materialStats: {
        Plastic: 45,
        Paper: 30,
        Glass: 15,
        Metal: 8,
        'E-Waste': 2
      }
    }
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Smart Waste Management API',
    endpoints: {
      health: '/api/health',
      bins: '/api/bins/all',
      recycling: '/api/recycling/centers',
      auth: '/api/auth/login',
      admin: '/api/admin/dashboard'
    },
    test_credentials: {
      admin: { email: 'admin@test.com', password: '123456' },
      citizen: { email: 'citizen@test.com', password: '123456' }
    }
  });
});

// Handle undefined routes - FIXED VERSION
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🌈 Smart Waste Management System
🚀 Server running on port ${PORT}
📍 Health Check: http://localhost:${PORT}/api/health
📊 Test Endpoints:
   • GET  http://localhost:${PORT}/api/bins/all
   • GET  http://localhost:${PORT}/api/recycling/centers  
   • POST http://localhost:${PORT}/api/auth/login
   • GET  http://localhost:${PORT}/api/admin/dashboard

🔐 Test Credentials:
   • Admin:  admin@test.com / 123456
   • Citizen: citizen@test.com / 123456

✅ Server ready! Open http://localhost:${PORT} to see all available endpoints.
  `);
});