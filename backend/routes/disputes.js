const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const disputeController = require('../controllers/disputeController');
const { verifyToken } = require('../middleware/auth');
const { uploadEvidence, handleUploadError } = require('../middleware/upload');
const validate = require('../middleware/validate');

router.post('/', 
  verifyToken,
  uploadEvidence,
  handleUploadError,
  [
    body('loanRequestId').isUUID().withMessage('Valid loan request ID required'),
    body('disputeType').isIn(['payment_not_received', 'wrong_amount', 'unauthorized_charge', 'terms_violation', 'other']).withMessage('Valid dispute type required'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
  ],
  validate,
  disputeController.createDispute
);

router.get('/my-disputes', verifyToken, disputeController.getMyDisputes);

router.post('/:id/note',
  verifyToken,
  uploadEvidence,
  handleUploadError,
  [
    body('note').trim().notEmpty().withMessage('Note is required')
  ],
  validate,
  disputeController.addDisputeNote
);

module.exports = router;
