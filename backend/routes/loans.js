const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const loanController = require('../controllers/loanController');
const { verifyToken, isLender, isBorrower, isOnboarded } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Borrower routes
router.post('/request', 
  verifyToken, 
  isBorrower, 
  isOnboarded,
  [
    body('amount').isFloat({ min: 500, max: 1000000 }).withMessage('Amount must be between 500 and 1000000'),
    body('purpose').trim().notEmpty().withMessage('Purpose is required'),
    body('duration').isInt({ min: 7, max: 365 }).withMessage('Duration must be between 7 and 365 days')
  ],
  validate,
  loanController.createLoanRequest
);

router.get('/my-requests', verifyToken, isBorrower, loanController.getMyBorrowRequests);
router.post('/:id/fulfill', verifyToken, isBorrower, loanController.markFulfilled);
router.post('/:id/cancel', verifyToken, isBorrower, loanController.cancelLoanRequest);

// Lender routes
router.get('/pending', verifyToken, isLender, isOnboarded, loanController.getPendingRequests);
router.get('/my-lending', verifyToken, isLender, loanController.getMyLendingHistory);
router.post('/:id/accept', verifyToken, isLender, isOnboarded, loanController.acceptLoanRequest);
router.post('/:id/repayment', 
  verifyToken, 
  isLender,
  [
    body('amount').isFloat({ min: 1 }).withMessage('Amount is required'),
    body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'upi', 'cheque', 'other'])
  ],
  validate,
  loanController.recordRepayment
);

// Common routes
router.get('/:id', verifyToken, loanController.getLoanRequestDetails);
router.post('/:id/rate', 
  verifyToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review').optional().trim()
  ],
  validate,
  loanController.rateUser
);

module.exports = router;
