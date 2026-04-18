const AuditLog = require("../models/AuditLog");

// 📋 GET LOGS
exports.getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: logs
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};