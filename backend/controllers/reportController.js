const Report = require('../models/Report');

// ================= CREATE REPORT =================
exports.createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      isAnonymous,
      media
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, Description aur Category required hai'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const report = await Report.create({
      user: req.user.id,
      title,
      description,
      category,
      location: location || null,
      media: media || {},
      isAnonymous: isAnonymous || false,
      status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report created successfully ✅'
    });

  } catch (error) {
    console.error('Create Report Error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= GET MY REPORTS =================
exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch (error) {
    console.error('My Reports Error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= GET ALL REPORTS (ADMIN) =================
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch (error) {
    console.error('All Reports Error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= GET SINGLE REPORT =================
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Owner ya Admin hi dekh sakta hai
    if (
      report.user._id.toString() !== req.user.id &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Single Report Error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= UPDATE STATUS =================
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (status) report.status = status;
    if (assignedTo) report.assignedTo = assignedTo;

    if (status === 'RESOLVED') {
      report.resolvedAt = new Date();
    }

    await report.save();

    res.json({
      success: true,
      data: report,
      message: 'Report updated successfully ✅'
    });

  } catch (error) {
    console.error('Update Error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ================= REPORT SUMMARY =================
exports.getReportsSummary = async (req, res) => {
  try {
    const total = await Report.countDocuments();
    const pending = await Report.countDocuments({ status: "PENDING" });
    const inProgress = await Report.countDocuments({ status: "IN_PROGRESS" });
    const resolved = await Report.countDocuments({ status: "RESOLVED" });

    res.json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        resolved
      }
    });

  } catch (error) {
    console.error('Summary Error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};