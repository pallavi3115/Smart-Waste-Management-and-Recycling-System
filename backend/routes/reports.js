const express = require('express');
const router = express.Router();

const {
  createReport,
  getMyReports,
  getReports,
  getReportById,
  updateReportStatus,
  getReportsSummary   // ✅ IMPORT
} = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/Auth');

// ✅ sab routes protected
router.use(protect);

// ✅ IMPORTANT: summary ko upar rakho
router.get('/summary', authorize('Admin'), getReportsSummary);

// USER
router.post('/', createReport);
router.get('/my-reports', getMyReports);

// ADMIN
router.get('/', authorize('Admin'), getReports);

// SINGLE REPORT
router.get('/:id', getReportById);

// UPDATE STATUS
router.put('/:id/status', authorize('Admin'), updateReportStatus);

module.exports = router;