const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createAuditLog } = require('./audit');

// Helper function to get client IP
const getClientIp = (req) => {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         'Unknown';
};

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // Log unauthorized access - no token
      await createAuditLog(
        req,
        'VIEW',
        'Authentication',
        `Unauthorized access attempt - No token provided`,
        { 
          url: req.originalUrl, 
          method: req.method,
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent']
        },
        'FAILED'
      );
      
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // For development with mock tokens
    if (token.startsWith('mock-jwt-token-')) {
      const userId = token.split('-').pop();
      
      // Mock users with proper ObjectId format - ADDED MORE USERS
      const mockUsers = {
        '1': {
          id: '000000000000000000000001',
          _id: '000000000000000000000001',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'Admin',
          phoneNumber: '9876543210',
          isActive: true
        },
        '2': {
          id: '000000000000000000000002',
          _id: '000000000000000000000002',
          name: 'Citizen User',
          email: 'citizen@test.com',
          role: 'Citizen',
          phoneNumber: '9876543211',
          isActive: true
        },
        '3': {
          id: '000000000000000000000003',
          _id: '000000000000000000000003',
          name: 'Driver User',
          email: 'driver@test.com',
          role: 'Driver',
          phoneNumber: '9876543212',
          isActive: true
        },
        // ADD MORE MOCK USERS FOR DIFFERENT IDS
        '4': {
          id: '000000000000000000000004',
          _id: '000000000000000000000004',
          name: 'Super Admin',
          email: 'superadmin@test.com',
          role: 'Admin',
          phoneNumber: '9876543213',
          isActive: true
        },
        '5': {
          id: '000000000000000000000005',
          _id: '000000000000000000000005',
          name: 'Staff User',
          email: 'staff@test.com',
          role: 'Admin',
          phoneNumber: '9876543214',
          isActive: true
        }
      };

      const user = mockUsers[userId];
      
      if (!user) {
        // Log invalid token - user not found
        await createAuditLog(
          req,
          'VIEW',
          'Authentication',
          `Invalid token attempt - User not found for token`,
          { 
            tokenPrefix: token.substring(0, 20) + '...',
            userId: userId,
            ipAddress: getClientIp(req)
          },
          'FAILED'
        );
        
        return res.status(401).json({
          success: false,
          message: 'Invalid token - User not found'
        });
      }

      // Set mock user with proper ObjectId format
      req.user = user;
      
      // Log successful authentication (optional - can be commented to reduce log noise)
      // Uncomment if you want to track every API access
      /*
      await createAuditLog(
        req,
        'VIEW',
        'Authentication',
        `User ${user.email} authenticated successfully`,
        { 
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          url: req.originalUrl,
          method: req.method
        },
        'SUCCESS'
      );
      */
      
      console.log('Mock user authenticated:', { id: req.user.id, role: req.user.role });
      return next();
    }

    // For real JWT tokens
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        // Log user not found in database
        await createAuditLog(
          req,
          'VIEW',
          'Authentication',
          `JWT token valid but user not found in database`,
          { 
            userId: decoded.id,
            tokenDecoded: { id: decoded.id, iat: decoded.iat },
            ipAddress: getClientIp(req)
          },
          'FAILED'
        );
        
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      req.user = user;
      
      // Log successful authentication (optional)
      /*
      await createAuditLog(
        req,
        'VIEW',
        'Authentication',
        `User ${user.email} authenticated via JWT`,
        { 
          userId: user._id,
          userEmail: user.email,
          userRole: user.role
        },
        'SUCCESS'
      );
      */
      
      next();
    } catch (jwtError) {
      // Log JWT verification failure
      let errorType = 'Unknown JWT error';
      let errorDetails = {};
      
      if (jwtError.name === 'JsonWebTokenError') {
        errorType = 'Invalid token format';
        errorDetails = { error: jwtError.message };
      } else if (jwtError.name === 'TokenExpiredError') {
        errorType = 'Token expired';
        errorDetails = { 
          error: jwtError.message,
          expiredAt: jwtError.expiredAt
        };
      } else {
        errorType = 'JWT verification failed';
        errorDetails = { error: jwtError.message };
      }
      
      await createAuditLog(
        req,
        'VIEW',
        'Authentication',
        `JWT verification failed - ${errorType}`,
        { 
          tokenPrefix: token.substring(0, 20) + '...',
          errorType: errorType,
          errorMessage: jwtError.message,
          ipAddress: getClientIp(req)
        },
        'FAILED'
      );
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    // Log unexpected error
    await createAuditLog(
      req,
      'VIEW',
      'Authentication',
      `Unexpected error in authentication middleware`,
      { 
        error: error.message,
        stack: error.stack,
        ipAddress: getClientIp(req)
      },
      'FAILED'
    );
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

exports.authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Case-insensitive role comparison
    const userRole = req.user.role?.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      // Log unauthorized access attempt with detailed information
      await createAuditLog(
        req,
        'VIEW',
        'Authorization',
        `Unauthorized access attempt - User ${req.user.email} tried to access restricted route`,
        { 
          userId: req.user.id,
          userEmail: req.user.email,
          userName: req.user.name,
          userRole: req.user.role,
          requiredRoles: roles,
          url: req.originalUrl,
          method: req.method,
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent']
        },
        'FAILED'
      );
      
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route. Required: ${roles.join(', ')}`,
        debug: {
          userRole: req.user.role,
          requiredRoles: roles,
          userId: req.user.id,
          userEmail: req.user.email
        }
      });
    }
    
    // Log successful authorization (optional - can be commented to reduce log noise)
    /*
    await createAuditLog(
      req,
      'VIEW',
      'Authorization',
      `User ${req.user.email} authorized for ${roles.join(', ')} access`,
      { 
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.originalUrl,
        method: req.method
      },
      'SUCCESS'
    );
    */
    
    next();
  };
};