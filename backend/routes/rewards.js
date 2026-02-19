const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');

// @desc    Get user rewards
// @route   GET /api/rewards/my-rewards
// @access  Private
router.get('/my-rewards', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      points: 0,
      level: 1,
      badges: []
    }
  });
});

// @desc    Get leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Public
router.get('/leaderboard', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// @desc    Claim reward
// @route   POST /api/rewards/claim
// @access  Private
router.post('/claim', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Reward claimed successfully'
  });
});

// @desc    Get reward shop
// @route   GET /api/rewards/shop
// @access  Private
router.get('/shop', protect, (req, res) => {
  const rewards = [
    { id: 1, name: '₹50 Gift Card', points: 500, icon: '🎁' },
    { id: 2, name: 'Plant a Tree', points: 200, icon: '🌳' },
    { id: 3, name: 'Premium Badge', points: 1000, icon: '⭐' }
  ];
  
  res.json({
    success: true,
    data: rewards
  });
});

// @desc    Get achievements
// @route   GET /api/rewards/achievements
// @access  Private
router.get('/achievements', protect, (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

module.exports = router;