const express = require('express');
const router = express.Router();

// Mock driver data
const getDriverData = (userId) => {
  return {
    _id: userId,
    user: {
      name: 'Driver User',
      email: 'driver@test.com',
      phoneNumber: '9876543212',
      profilePicture: 'default-avatar.png'
    },
    employeeId: 'DRV001',
    vehicleType: 'Truck',
    vehicleNumber: 'DL-01-AB-1234',
    assignedZone: 'Zone A',
    shift: 'Morning',
    isOnline: true,
    performance: {
      rating: 4.5,
      totalCollections: 128,
      onTimeDeliveries: 115,
      customerRating: 4.7
    },
    earnings: {
      totalEarned: 45000,
      bonus: 5000,
      baseSalary: 40000
    }
  };
};

// Middleware to verify driver token
const verifyDriverToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !token.startsWith('mock-jwt-token-')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const userId = token.split('-').pop();
  
  // Mock users
  const users = {
    '1': { id: '1', name: 'Admin User', role: 'Admin' },
    '2': { id: '2', name: 'Citizen User', role: 'Citizen' },
    '3': { id: '3', name: 'Driver User', role: 'Driver' }
  };
  
  const user = users[userId];
  
  if (!user || user.role !== 'Driver') {
    return res.status(403).json({ success: false, message: 'Access denied. Driver only.' });
  }
  
  req.user = user;
  next();
};

// Driver Dashboard Route
router.get('/dashboard', verifyDriverToken, (req, res) => {
  console.log('Driver dashboard accessed by:', req.user.email);
  
  res.json({
    success: true,
    data: {
      driver: getDriverData(req.user.id),
      todayRoute: {
        id: 'R001',
        routeId: 'R-2024-001',
        status: 'Assigned',
        stopsCount: 12,
        completedStops: 0,
        progress: 0,
        totalWaste: 0,
        isOnSchedule: true
      },
      weeklyStats: {
        totalWaste: 1250,
        averagePerDay: 178.5
      },
      attendance: {
        presentDays: 18,
        lateDays: 2,
        absentDays: 0,
        totalDays: 20
      },
      notifications: [
        { title: 'New Route Assigned', message: 'You have a new route for today', type: 'route' }
      ]
    }
  });
});

// Update location
router.post('/location', verifyDriverToken, (req, res) => {
  const { lat, lng } = req.body;
  console.log(`📍 Driver ${req.user.email} location: ${lat}, ${lng}`);
  res.json({ success: true, message: 'Location updated' });
});

// Get driver profile
router.get('/profile', verifyDriverToken, (req, res) => {
  res.json({
    success: true,
    data: getDriverData(req.user.id)
  });
});

// Update driver profile
router.put('/profile', verifyDriverToken, (req, res) => {
  res.json({ success: true, message: 'Profile updated successfully' });
});

// Toggle online status
router.put('/toggle-status', verifyDriverToken, (req, res) => {
  res.json({ success: true, isOnline: true, message: 'Status updated' });
});

// Get driver earnings
router.get('/earnings', verifyDriverToken, (req, res) => {
  res.json({
    success: true,
    data: {
      current: {
        totalEarned: 45000,
        bonus: 5000,
        baseSalary: 40000
      },
      monthlyBreakdown: [
        { _id: '2024-01', totalWaste: 1250, collections: 45 },
        { _id: '2024-02', totalWaste: 1350, collections: 48 },
        { _id: '2024-03', totalWaste: 1450, collections: 52 }
      ]
    }
  });
});

module.exports = router;