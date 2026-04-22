const AuditLog = require('../models/AuditLog');
const { createAuditLog } = require('../middleware/audit');

// @desc    Get all audit logs with filters
// @route   GET /api/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action, 
      module, 
      user,
      startDate,
      endDate,
      search 
    } = req.query;
    
    // Build filter
    let filter = {};
    
    if (action) filter.action = action;
    if (module) filter.module = module;
    if (user) filter.user = { $regex: user, $options: 'i' };
    
    // Search in description
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { user: { $regex: search, $options: 'i' } },
        { module: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'name email'),
      AuditLog.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single audit log by ID
// @route   GET /api/audit-logs/:id
// @access  Private/Admin
const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('userId', 'name email');
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }
    
    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get audit logs for specific user
// @route   GET /api/audit-logs/user/:userId
// @access  Private/Admin
const getAuditLogsByUser = async (req, res) => {
  try {
    const logs = await AuditLog.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get audit logs statistics
// @route   GET /api/audit-logs/stats
// @access  Private/Admin
const getAuditStats = async (req, res) => {
  try {
    const [totalLogs, actionStats, moduleStats, dailyStats, userStats] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        { $group: { _id: '$module', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 30 }
      ]),
      AuditLog.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    // Calculate trends
    const today = new Date();
    const lastWeek = new Date(today.setDate(today.getDate() - 7));
    
    const recentLogs = await AuditLog.countDocuments({
      createdAt: { $gte: lastWeek }
    });
    
    res.json({
      success: true,
      data: {
        totalLogs,
        recentLogs,
        actionStats,
        moduleStats,
        dailyStats,
        topUsers: userStats
      }
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get audit logs by date range
// @route   GET /api/audit-logs/range/:start/:end
// @access  Private/Admin
const getAuditLogsByDateRange = async (req, res) => {
  try {
    const { start, end } = req.params;
    
    const logs = await AuditLog.find({
      createdAt: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: logs,
      count: logs.length,
      range: { start, end }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get audit logs by action type
// @route   GET /api/audit-logs/action/:action
// @access  Private/Admin
const getAuditLogsByAction = async (req, res) => {
  try {
    const { action } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      AuditLog.find({ action: action.toUpperCase() })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments({ action: action.toUpperCase() })
    ]);
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get audit logs by module
// @route   GET /api/audit-logs/module/:module
// @access  Private/Admin
const getAuditLogsByModule = async (req, res) => {
  try {
    const { module } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [logs, total] = await Promise.all([
      AuditLog.find({ module: module })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments({ module: module })
    ]);
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete old audit logs (cleanup)
// @route   DELETE /api/audit-logs/cleanup
// @access  Private/Admin
const cleanupAuditLogs = async (req, res) => {
  try {
    const { days = 90 } = req.query; // Keep logs for 90 days by default
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    // Log the cleanup action
    await createAuditLog(
      req, 
      'DELETE', 
      'Settings', 
      `Cleaned up ${result.deletedCount} old audit logs (older than ${days} days)`,
      { 
        deletedCount: result.deletedCount,
        olderThanDays: days,
        cutoffDate: cutoffDate
      }
    );
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old audit logs`,
      deletedCount: result.deletedCount,
      olderThanDays: days
    });
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Export audit logs
// @route   GET /api/audit-logs/export
// @access  Private/Admin
const exportAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, action, module } = req.query;
    
    let filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (action) filter.action = action;
    if (module) filter.module = module;
    
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(10000);
    
    // Log the export action
    await createAuditLog(
      req,
      'EXPORT',
      'Audit Logs',
      `Exported ${logs.length} audit logs`,
      { 
        exportCount: logs.length,
        filters: { startDate, endDate, action, module }
      }
    );
    
    res.json({
      success: true,
      data: logs,
      exportCount: logs.length,
      exportedAt: new Date()
    });
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get audit log summary for dashboard
// @route   GET /api/audit-logs/summary
// @access  Private/Admin
const getAuditSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [total, todayCount, weekCount, monthCount, topActions] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      AuditLog.countDocuments({ 
        createdAt: { $gte: new Date(today.setDate(today.getDate() - 7)) } 
      }),
      AuditLog.countDocuments({ 
        createdAt: { $gte: new Date(today.setMonth(today.getMonth() - 1)) } 
      }),
      AuditLog.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        today: todayCount,
        week: weekCount,
        month: monthCount,
        topActions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getAuditLogsByUser,
  getAuditStats,
  getAuditLogsByDateRange,
  getAuditLogsByAction,
  getAuditLogsByModule,
  cleanupAuditLogs,
  exportAuditLogs,
  getAuditSummary
};