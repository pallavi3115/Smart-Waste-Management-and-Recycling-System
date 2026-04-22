const AuditLog = require('../models/AuditLog');

// Get client IP address - FIXED with optional chaining
const getClientIp = (req) => {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         'Unknown';
};

// Main audit logging function
const createAuditLog = async (req, action, module, description, details = {}, status = 'SUCCESS') => {
  try {
    // Check if AuditLog model exists
    if (!AuditLog) {
      console.warn('⚠️ AuditLog model not available');
      return null;
    }
    
    const auditEntry = new AuditLog({
      user: req.user?.name || req.user?.email || 'System',
      userId: req.user?._id || req.user?.id,
      action: action,
      module: module,
      description: description,
      details: details,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'Unknown',
      status: status
    });
    
    await auditEntry.save();
    console.log(`✅ Audit Log Created: ${action} - ${module} - ${status}`);
    return auditEntry;
  } catch (error) {
    console.error('❌ Failed to create audit log:', error.message);
    // Don't throw error - audit logging should not break the main flow
    return null;
  }
};

// Middleware for automatic audit logging
const auditMiddleware = (module) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    const originalJson = res.json;
    const originalStatus = res.status;
    
    // Override send function to capture response
    res.send = function(data) {
      // Check if request was successful (status code 2xx)
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      
      // Determine action based on HTTP method
      let action = 'VIEW';
      switch (req.method) {
        case 'POST':
          action = 'CREATE';
          break;
        case 'PUT':
        case 'PATCH':
          action = 'UPDATE';
          break;
        case 'DELETE':
          action = 'DELETE';
          break;
        default:
          action = 'VIEW';
      }
      
      // Create description
      let description = '';
      if (action === 'CREATE') description = `Created new ${module.toLowerCase()} item`;
      else if (action === 'UPDATE') description = `Updated ${module.toLowerCase()} details`;
      else if (action === 'DELETE') description = `Deleted ${module.toLowerCase()} record`;
      else description = `Viewed ${module.toLowerCase()} data`;
      
      // Create audit log (don't await to not block response)
      createAuditLog(req, action, module, description, {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
        statusCode: res.statusCode
      }, isSuccess ? 'SUCCESS' : 'FAILED').catch(err => {
        console.error('Audit log creation error:', err);
      });
      
      // Call original send
      originalSend.call(this, data);
    };
    
    // Also override json method
    res.json = function(data) {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      
      let action = 'VIEW';
      switch (req.method) {
        case 'POST': action = 'CREATE'; break;
        case 'PUT': case 'PATCH': action = 'UPDATE'; break;
        case 'DELETE': action = 'DELETE'; break;
        default: action = 'VIEW';
      }
      
      let description = '';
      if (action === 'CREATE') description = `Created new ${module.toLowerCase()} item`;
      else if (action === 'UPDATE') description = `Updated ${module.toLowerCase()} details`;
      else if (action === 'DELETE') description = `Deleted ${module.toLowerCase()} record`;
      else description = `Viewed ${module.toLowerCase()} data`;
      
      createAuditLog(req, action, module, description, {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
        statusCode: res.statusCode,
        responseData: data
      }, isSuccess ? 'SUCCESS' : 'FAILED').catch(err => {
        console.error('Audit log creation error:', err);
      });
      
      originalJson.call(this, data);
    };
    
    next();
  };
};

// Function to log before and after changes for updates
const logUpdate = async (req, module, itemId, beforeData, afterData, status = 'SUCCESS') => {
  try {
    const changes = {};
    
    // Compare objects to find what changed
    if (beforeData && afterData) {
      Object.keys(afterData).forEach(key => {
        if (beforeData[key] !== afterData[key]) {
          changes[key] = {
            from: beforeData[key],
            to: afterData[key]
          };
        }
      });
    }
    
    await createAuditLog(
      req,
      'UPDATE',
      module,
      `Updated ${module.toLowerCase()} - ${itemId}`,
      {
        itemId,
        changes: changes,
        changedFields: Object.keys(changes),
        beforeData: beforeData,
        afterData: afterData
      },
      status
    );
  } catch (error) {
    console.error('Error in logUpdate:', error);
  }
};

// Function to log delete operations
const logDelete = async (req, module, itemId, itemData, status = 'SUCCESS') => {
  try {
    await createAuditLog(
      req,
      'DELETE',
      module,
      `Deleted ${module.toLowerCase()} - ${itemId}`,
      {
        itemId,
        deletedData: itemData
      },
      status
    );
  } catch (error) {
    console.error('Error in logDelete:', error);
  }
};

// Function to log create operations
const logCreate = async (req, module, itemId, itemData, status = 'SUCCESS') => {
  try {
    await createAuditLog(
      req,
      'CREATE',
      module,
      `Created new ${module.toLowerCase()} - ${itemId}`,
      {
        itemId,
        createdData: itemData
      },
      status
    );
  } catch (error) {
    console.error('Error in logCreate:', error);
  }
};

// Function to log login/logout
const logAuth = async (req, action, user, status = 'SUCCESS') => {
  try {
    await createAuditLog(
      req,
      action,
      'Authentication',
      `${action === 'LOGIN' ? 'User logged in' : 'User logged out'} - ${user?.email || user?.name}`,
      {
        userEmail: user?.email,
        userName: user?.name,
        userId: user?._id || user?.id,
        loginTime: action === 'LOGIN' ? new Date().toISOString() : undefined,
        logoutTime: action === 'LOGOUT' ? new Date().toISOString() : undefined
      },
      status
    );
  } catch (error) {
    console.error('Error in logAuth:', error);
  }
};

// Function to log bulk operations
const logBulkOperation = async (req, action, module, description, items, status = 'SUCCESS') => {
  try {
    await createAuditLog(
      req,
      action,
      module,
      description,
      {
        itemsCount: items?.length || 0,
        items: items,
        operation: action,
        timestamp: new Date().toISOString()
      },
      status
    );
  } catch (error) {
    console.error('Error in logBulkOperation:', error);
  }
};

// Function to log export operations
const logExport = async (req, module, exportType, recordCount, status = 'SUCCESS') => {
  try {
    await createAuditLog(
      req,
      'EXPORT',
      module,
      `Exported ${exportType} data`,
      {
        exportType: exportType,
        recordCount: recordCount,
        format: 'CSV',
        exportTime: new Date().toISOString()
      },
      status
    );
  } catch (error) {
    console.error('Error in logExport:', error);
  }
};

// Function to get audit logs for a specific user
const getUserAuditLogs = async (userId, limit = 100) => {
  try {
    const logs = await AuditLog.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    return logs;
  } catch (error) {
    console.error('Error getting user audit logs:', error);
    return [];
  }
};

// Function to get audit logs by date range
const getAuditLogsByDateRange = async (startDate, endDate, module = null) => {
  try {
    let query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (module) {
      query.module = module;
    }
    
    const logs = await AuditLog.find(query).sort({ createdAt: -1 });
    return logs;
  } catch (error) {
    console.error('Error getting audit logs by date range:', error);
    return [];
  }
};

module.exports = {
  createAuditLog,
  auditMiddleware,
  logUpdate,
  logDelete,
  logCreate,
  logAuth,
  logBulkOperation,
  logExport,
  getUserAuditLogs,
  getAuditLogsByDateRange,
  getClientIp
};