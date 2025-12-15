const { Report, User, LoanRequest, ActivityLog } = require('../models/associations');
const { createNotification } = require('../services/notificationService');

// Create report
exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, loanRequestId, reportType, description } = req.body;
    const reporterId = req.user.id;

    // Can't report yourself
    if (reporterId === reportedUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot report yourself'
      });
    }

    // Check if reported user exists
    const reportedUser = await User.findByPk(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle evidence files
    let evidence = null;
    if (req.files && req.files.length > 0) {
      evidence = req.files.map(f => `/uploads/evidence/${f.filename}`);
    }

    const report = await Report.create({
      reporterId,
      reportedUserId,
      loanRequestId,
      reportType,
      description,
      evidence
    });

    // Increment report count
    reportedUser.reportCount += 1;
    
    // Auto-block if too many reports (configurable threshold)
    const autoBlockThreshold = 5;
    if (reportedUser.reportCount >= autoBlockThreshold) {
      reportedUser.isBlocked = true;
      reportedUser.blockReason = 'Automatically blocked due to multiple reports';
    }
    
    await reportedUser.save();

    // Notify reported user
    await createNotification({
      userId: reportedUserId,
      type: 'report_filed',
      title: 'Report Filed',
      message: 'A report has been filed against you. Our team will review it.',
      relatedId: report.id,
      relatedType: 'Report'
    });

    // Log activity
    await ActivityLog.create({
      userId: reporterId,
      action: 'FILE_REPORT',
      description: `Filed report against user for ${reportType}`,
      entityType: 'Report',
      entityId: report.id
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: error.message
    });
  }
};

// Get user's reports
exports.getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'filed', page = 1, limit = 20 } = req.query;

    const where = type === 'filed' 
      ? { reporterId: userId }
      : { reportedUserId: userId };

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'reportedUser', attributes: ['id', 'firstName', 'lastName'] },
        { model: LoanRequest, attributes: ['id', 'amount', 'status'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        reports: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
      error: error.message
    });
  }
};
