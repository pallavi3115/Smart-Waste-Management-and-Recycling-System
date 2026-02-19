// const express = require('express');
// const {
//   register,
//   login,
//   logout,
//   getMe,
//   updateProfile,
//   changePassword,
//   forgotPassword,
//   resetPassword,
//   verifyEmail
// } = require('../controllers/authController');
// const { protect } = require('../middleware/Auth');

// const router = express.Router();

// // Public routes
// router.post('/register', register);
// router.post('/login', login);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password/:token', resetPassword);
// router.get('/verify-email/:token', verifyEmail);

// // Protected routes
// router.use(protect); // All routes below this require authentication
// router.get('/me', getMe);
// router.post('/logout', logout);
// router.put('/profile', updateProfile);
// router.put('/change-password', changePassword);

// module.exports = router;

const express = require('express');
const router = express.Router();

// Mock users for testing
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
    name: 'Citizen User',
    email: 'citizen@test.com',
    password: '123456',
    role: 'Citizen'
  }
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user exists
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user (mock)
    const user = {
      id: (users.length + 1).toString(),
      name,
      email,
      password,
      role: role || 'Citizen'
    };

    // Generate mock token
    const token = 'mock-jwt-token-' + user.id;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check user
    const user = users.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', (req, res) => {
  try {
    // Mock implementation - in real app, verify token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Extract user id from mock token
    const userId = token.split('-').pop();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const userId = token.split('-').pop();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user (mock)
    const updatedUser = {
      ...users[userIndex],
      name: req.body.name || users[userIndex].name,
      email: req.body.email || users[userIndex].email
    };

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', (req, res) => {
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', (req, res) => {
  res.json({
    success: true,
    message: 'Password reset email sent'
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', (req, res) => {
  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', (req, res) => {
  res.json({
    success: true,
    message: 'Email verified successfully'
  });
});

module.exports = router;