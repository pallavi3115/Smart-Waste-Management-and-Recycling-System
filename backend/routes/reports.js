const express = require('express');
const {
  createReport,
  getMyReports,
  getReports,
  getReportById,
  updateReportStatus
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/Auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createReport);
router.get('/my-reports', getMyReports);
router.get('/:id', getReportById);

// Admin routes
router.get('/', authorize('Admin'), getReports);
router.put('/:id/status', authorize('Admin'), updateReportStatus);

module.exports = router;