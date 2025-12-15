const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');
const { uploadEvidence, handleUploadError } = require('../middleware/upload');
const validate = require('../middleware/validate');

router.post('/', 
  verifyToken,
  uploadEvidence,
  handleUploadError,
  [
    body('reportedUserId').isUUID().withMessage('Valid user ID required'),
    body('reportType').isIn(['fraud', 'harassment', 'non_payment', 'false_information', 'inappropriate_behavior', 'other']).withMessage('Valid report type required'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
  ],
  validate,
  reportController.createReport
);

router.get('/my-reports', verifyToken, reportController.getMyReports);

module.exports = router;
