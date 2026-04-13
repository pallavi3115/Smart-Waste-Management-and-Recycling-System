const express = require('express');
const router = express.Router();

// Middleware to verify driver token
const verifyDriverToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !token.startsWith('mock-jwt-token-')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const userId = token.split('-').pop();
  
  const users = {
    '1': { id: '1', role: 'Admin' },
    '2': { id: '2', role: 'Citizen' },
    '3': { id: '3', role: 'Driver' }
  };
  
  const user = users[userId];
  
  if (!user || user.role !== 'Driver') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  
  req.user = user;
  next();
};

// Check in
router.post('/check-in', verifyDriverToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Checked in successfully', 
    time: new Date(),
    data: { checkIn: { time: new Date() } }
  });
});

// Check out
router.post('/check-out', verifyDriverToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Checked out successfully', 
    time: new Date(),
    data: { checkOut: { time: new Date() } }
  });
});

// Get attendance history
router.get('/', verifyDriverToken, (req, res) => {
  res.json({
    success: true,
    data: {
      records: [
        { _id: '1', date: new Date(), shift: 'Morning', status: 'Present', lateMinutes: 0, overtime: 0 },
        { _id: '2', date: new Date(Date.now() - 86400000), shift: 'Morning', status: 'Present', lateMinutes: 0, overtime: 0 },
        { _id: '3', date: new Date(Date.now() - 172800000), shift: 'Morning', status: 'Late', lateMinutes: 15, overtime: 0 }
      ],
      stats: { present: 18, late: 2, absent: 0, totalOvertime: 120 }
    }
  });
});

module.exports = router;