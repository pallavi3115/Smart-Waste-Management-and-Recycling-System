const express = require('express');
const router = express.Router();
const { createAuditLog, logAuth } = require('../middleware/audit');

// Mock users for testing - INCLUDING DRIVER
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
  },
  {
    id: '3',
    name: 'Driver User',
    email: 'driver@test.com',
    password: '123456',
    role: 'Driver'
  }
];

// Helper function to get client IP
const getClientIp = (req) => {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         'Unknown';
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      // Log failed registration attempt
      await createAuditLog(
        req,
        'CREATE',
        'Authentication',
        `Failed registration attempt - Missing required fields`,
        { email, name: name || 'Not provided', reason: 'Missing required fields' },
        'FAILED'
      );
      
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user exists
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      // Log failed registration - user already exists
      await createAuditLog(
        req,
        'CREATE',
        'Authentication',
        `Failed registration attempt - User already exists: ${email}`,
        { email, reason: 'User already exists' },
        'FAILED'
      );
      
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
    
    users.push(user);

    // Generate mock token
    const token = 'mock-jwt-token-' + user.id;

    // Log successful registration
    await createAuditLog(
      req,
      'CREATE',
      'Authentication',
      `New user registered: ${email} with role ${user.role}`,
      { 
        userId: user.id,
        userEmail: email,
        userName: name,
        userRole: user.role,
        registrationMethod: 'email'
      },
      'SUCCESS'
    );

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
    // Log error
    await createAuditLog(
      req,
      'CREATE',
      'Authentication',
      `Registration error: ${error.message}`,
      { error: error.message },
      'FAILED'
    );
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', email);

    // Simple validation
    if (!email || !password) {
      // Log failed login - missing credentials
      await createAuditLog(
        req,
        'LOGIN',
        'Authentication',
        `Failed login attempt - Missing credentials`,
        { email: email || 'Not provided', reason: 'Missing email or password' },
        'FAILED'
      );
      
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check user
    const user = users.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      console.log('❌ Login failed for:', email);
      
      // Log failed login - invalid credentials
      await createAuditLog(
        req,
        'LOGIN',
        'Authentication',
        `Failed login attempt for: ${email}`,
        { 
          userEmail: email,
          reason: 'Invalid credentials',
          ipAddress: getClientIp(req)
        },
        'FAILED'
      );
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Use: admin@test.com, citizen@test.com, or driver@test.com with password 123456'
      });
    }

    // Generate token
    const token = 'mock-jwt-token-' + user.id;

    console.log('✅ Login successful:', email, 'Role:', user.role);

    // Log successful login
    await createAuditLog(
      req,
      'LOGIN',
      'Authentication',
      `Successful login: ${email} (${user.role})`,
      { 
        userId: user.id,
        userEmail: email,
        userName: user.name,
        userRole: user.role,
        loginTime: new Date().toISOString(),
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent']
      },
      'SUCCESS'
    );

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
    // Log error
    await createAuditLog(
      req,
      'LOGIN',
      'Authentication',
      `Login error: ${error.message}`,
      { error: error.message },
      'FAILED'
    );
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
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
      // Log unauthorized access attempt
      await createAuditLog(
        req,
        'VIEW',
        'Authentication',
        `Unauthorized access attempt - Invalid token`,
        { token: token.substring(0, 20) + '...' },
        'FAILED'
      );
      
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log profile view
    await createAuditLog(
      req,
      'VIEW',
      'Authentication',
      `User ${user.email} viewed their profile`,
      { userId: user.id, userEmail: user.email },
      'SUCCESS'
    );

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
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let userEmail = 'Unknown';
    
    if (token) {
      const userId = token.split('-').pop();
      const user = users.find(u => u.id === userId);
      if (user) {
        userEmail = user.email;
        
        // Log successful logout
        await createAuditLog(
          req,
          'LOGOUT',
          'Authentication',
          `User ${userEmail} logged out`,
          { 
            userId: user.id,
            userEmail: userEmail,
            logoutTime: new Date().toISOString()
          },
          'SUCCESS'
        );
      }
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', async (req, res) => {
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

    const oldUserData = { ...users[userIndex] };
    
    // Update user (mock)
    const updatedUser = {
      ...users[userIndex],
      name: req.body.name || users[userIndex].name,
      email: req.body.email || users[userIndex].email
    };
    
    users[userIndex] = updatedUser;
    
    // Track changes
    const changes = [];
    if (oldUserData.name !== updatedUser.name) {
      changes.push(`Name changed from "${oldUserData.name}" to "${updatedUser.name}"`);
    }
    if (oldUserData.email !== updatedUser.email) {
      changes.push(`Email changed from "${oldUserData.email}" to "${updatedUser.email}"`);
    }
    
    // Log profile update
    await createAuditLog(
      req,
      'UPDATE',
      'Authentication',
      `User ${updatedUser.email} updated their profile`,
      { 
        userId: updatedUser.id,
        userEmail: updatedUser.email,
        changes: changes,
        oldData: { name: oldUserData.name, email: oldUserData.email },
        newData: { name: updatedUser.name, email: updatedUser.email }
      },
      'SUCCESS'
    );

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
    await createAuditLog(
      req,
      'UPDATE',
      'Authentication',
      `Profile update failed: ${error.message}`,
      { error: error.message },
      'FAILED'
    );
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const userId = token.split('-').pop();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Log password change (without logging the actual password)
    await createAuditLog(
      req,
      'UPDATE',
      'Authentication',
      `User ${user.email} changed their password`,
      { 
        userId: user.id,
        userEmail: user.email,
        passwordChangedAt: new Date().toISOString()
      },
      'SUCCESS'
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Log password reset request (even if email doesn't exist - for security)
    await createAuditLog(
      req,
      'UPDATE',
      'Authentication',
      `Password reset requested for: ${email || 'No email provided'}`,
      { 
        requestedEmail: email,
        requestTime: new Date().toISOString(),
        ipAddress: getClientIp(req)
      },
      'SUCCESS'
    );
    
    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Log password reset
    await createAuditLog(
      req,
      'UPDATE',
      'Authentication',
      `Password reset completed using token: ${token.substring(0, 10)}...`,
      { 
        resetToken: token.substring(0, 10) + '...',
        resetTime: new Date().toISOString()
      },
      'SUCCESS'
    );
    
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Log email verification
    await createAuditLog(
      req,
      'UPDATE',
      'Authentication',
      `Email verification attempted with token: ${token.substring(0, 10)}...`,
      { 
        verificationToken: token.substring(0, 10) + '...',
        verificationTime: new Date().toISOString()
      },
      'SUCCESS'
    );
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;