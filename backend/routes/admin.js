const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes are protected and require Admin role
router.use(protect);
router.use(authorize('Admin'));

// Admin dashboard stats
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      totalBins: 156,
      binsCollectedToday: 23,
      recyclingRate: '68%',
      activeAlerts: 3,
      monthlyTrend: '+12%'
    }
  });
});

module.exports = router;