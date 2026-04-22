const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/Auth');
const {
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
} = require('../controllers/auditController');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('Admin'));

// Main routes
router.get('/', getAuditLogs);
router.get('/stats', getAuditStats);
router.get('/summary', getAuditSummary);
router.get('/export', exportAuditLogs);
router.get('/:id', getAuditLogById);

// Filter routes
router.get('/user/:userId', getAuditLogsByUser);
router.get('/action/:action', getAuditLogsByAction);
router.get('/module/:module', getAuditLogsByModule);
router.get('/range/:start/:end', getAuditLogsByDateRange);

// Cleanup route
router.delete('/cleanup', cleanupAuditLogs);

module.exports = router;