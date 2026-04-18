const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: String,
  action: String,
  module: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);