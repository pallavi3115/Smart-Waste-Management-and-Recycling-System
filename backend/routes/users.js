// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth');

// // @desc    Get all users
// // @route   GET /api/users
// // @access  Private/Admin
// router.get('/', protect, authorize('Admin'), (req, res) => {
//   res.json({
//     success: true,
//     data: []
//   });
// });

// // @desc    Get user by ID
// // @route   GET /api/users/:id
// // @access  Private/Admin
// router.get('/:id', protect, authorize('Admin'), (req, res) => {
//   res.json({
//     success: true,
//     data: {
//       id: req.params.id,
//       name: 'Sample User',
//       email: 'user@example.com',
//       role: 'Citizen'
//     }
//   });
// });

// // @desc    Update user
// // @route   PUT /api/users/:id
// // @access  Private/Admin
// router.put('/:id', protect, authorize('Admin'), (req, res) => {
//   res.json({
//     success: true,
//     data: req.body
//   });
// });

// // @desc    Delete user
// // @route   DELETE /api/users/:id
// // @access  Private/Admin
// router.delete('/:id', protect, authorize('Admin'), (req, res) => {
//   res.json({
//     success: true,
//     message: 'User deleted successfully'
//   });
// });

// // @desc    Get user profile
// // @route   GET /api/users/profile/me
// // @access  Private
// router.get('/profile/me', protect, (req, res) => {
//   res.json({
//     success: true,
//     data: req.user
//   });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');

// Mock user data for testing (remove when database is connected)
const mockUsers = {
  '1': {
    _id: '1',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'Admin',
    phoneNumber: '9876543210',
    profilePicture: 'default-avatar.png',
    address: {
      street: '123 Admin Street',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001'
    },
    preferences: {
      notifications: { email: true, sms: false, push: true }
    },
    createdAt: new Date('2024-01-01'),
    rewards: {
      points: 1250,
      level: 3,
      badges: [
        { name: 'First Report', icon: '🏆' },
        { name: 'Weekly Champion', icon: '⭐' }
      ]
    },
    reports: [
      { id: '1', title: 'Overflowing Bin', status: 'RESOLVED', createdAt: new Date('2024-02-01') },
      { id: '2', title: 'Damaged Bin', status: 'IN_PROGRESS', createdAt: new Date('2024-02-15') }
    ],
    recycling: {
      total: 45,
      co2Saved: 120
    }
  },
  '2': {
    _id: '2',
    name: 'Citizen User',
    email: 'citizen@test.com',
    role: 'Citizen',
    phoneNumber: '9876543211',
    profilePicture: 'default-avatar.png',
    address: {
      street: '456 Citizen Colony',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001'
    },
    preferences: {
      notifications: { email: true, sms: true, push: true }
    },
    createdAt: new Date('2024-01-15'),
    rewards: {
      points: 500,
      level: 2,
      badges: [
        { name: 'First Report', icon: '🏆' }
      ]
    },
    reports: [
      { id: '3', title: 'Missed Collection', status: 'PENDING', createdAt: new Date('2024-02-10') }
    ],
    recycling: {
      total: 15,
      co2Saved: 40
    }
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user);
    
    // Get user ID from the protect middleware
    const userId = req.user.id || req.user._id;
    
    // For mock data (remove when using real database)
    const userData = mockUsers[userId] || {
      _id: userId,
      name: req.user.name || 'Test User',
      email: req.user.email || 'test@example.com',
      role: req.user.role || 'Citizen',
      phoneNumber: req.user.phoneNumber || '',
      profilePicture: 'default-avatar.png',
      address: {},
      preferences: { notifications: { email: true, sms: false, push: true } },
      createdAt: new Date(),
      rewards: { points: 100, level: 1, badges: [] },
      reports: [],
      recycling: { total: 0, co2Saved: 0 }
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, (req, res) => {
  try {
    const { name, phoneNumber, address } = req.body;
    
    // In a real app, update in database
    // For mock, just return updated data
    res.json({
      success: true,
      data: {
        _id: req.user.id,
        name: name || req.user.name,
        email: req.user.email,
        phoneNumber: phoneNumber || req.user.phoneNumber,
        address: address || {},
        role: req.user.role,
        profilePicture: req.user.profilePicture || 'default-avatar.png'
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userData = mockUsers[userId] || { reports: [], recycling: { total: 0 } };
    
    res.json({
      success: true,
      data: {
        totalReports: userData.reports?.length || 0,
        resolvedReports: userData.reports?.filter(r => r.status === 'RESOLVED').length || 0,
        pendingReports: userData.reports?.filter(r => r.status === 'PENDING').length || 0,
        totalRecycled: userData.recycling?.total || 0,
        co2Saved: userData.recycling?.co2Saved || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// @desc    Get user reports
// @route   GET /api/users/reports
// @access  Private
router.get('/reports', protect, (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userData = mockUsers[userId] || { reports: [] };
    
    res.json({
      success: true,
      data: userData.reports || []
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// @desc    Get user rewards
// @route   GET /api/users/rewards
// @access  Private
router.get('/rewards', protect, (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userData = mockUsers[userId] || { rewards: { points: 0, level: 1, badges: [] } };
    
    res.json({
      success: true,
      data: userData.rewards || { points: 0, level: 1, badges: [] }
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rewards'
    });
  }
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', protect, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // In a real app, verify current password and update
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// @desc    Update notification preferences
// @route   PUT /api/users/notifications
// @access  Private
router.put('/notifications', protect, (req, res) => {
  try {
    const preferences = req.body;
    
    res.json({
      success: true,
      data: preferences,
      message: 'Notification preferences updated'
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notifications'
    });
  }
});

module.exports = router;