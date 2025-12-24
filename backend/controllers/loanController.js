const { LoanRequest, User, Repayment, ActivityLog } = require('../models/associations');
const { Op } = require('sequelize');
const { createNotification, notificationTemplates } = require('../services/notificationService');
const { calculateTrustScore, calculateRepaymentScore, updateUserRating } = require('../services/scoringService');

// Create loan request (Borrower)
exports.createLoanRequest = async (req, res) => {
  try {
    const { amount, purpose, duration, interestRate } = req.body;
    const borrowerId = req.user.id;

    // Validate amount against settings (could fetch from Settings model)
    const minAmount = 500;
    const maxAmount = 100000;
    
    if (amount < minAmount || amount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Amount must be between ₹${minAmount} and ₹${maxAmount}`
      });
    }

    const loanRequest = await LoanRequest.create({
      borrowerId,
      amount,
      purpose,
      duration,
      interestRate: interestRate || 10
    });

    // Log activity
    await ActivityLog.create({
      userId: borrowerId,
      action: 'CREATE_LOAN_REQUEST',
      description: `Created loan request for ₹${amount}`,
      entityType: 'LoanRequest',
      entityId: loanRequest.id
    });

    // Get borrower details for notification
    const borrower = await User.findByPk(borrowerId);
    
    // Notify all admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'loan_request',
        title: 'New Loan Request',
        message: `${borrower.firstName} ${borrower.lastName} requested ₹${amount} for ${purpose}`,
        relatedId: loanRequest.id,
        relatedType: 'LoanRequest'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Loan request created successfully',
      data: loanRequest
    });
  } catch (error) {
    console.error('Create loan request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create loan request',
      error: error.message
    });
  }
};

// Get all pending loan requests (Lender view)
exports.getPendingRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, minAmount, maxAmount, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    const where = { 
      status: 'pending',
      isVisible: true
    };

    if (minAmount) where.amount = { ...where.amount, [Op.gte]: minAmount };
    if (maxAmount) where.amount = { ...where.amount, [Op.lte]: maxAmount };

    const { count, rows } = await LoanRequest.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'borrower',
        attributes: ['id', 'firstName', 'lastName', 'profilePhoto', 'trustScore', 'repaymentScore', 'averageRating', 'totalRatings', 'city', 'state']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        requests: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get loan requests',
      error: error.message
    });
  }
};

// Get loan request details
exports.getLoanRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const loanRequest = await LoanRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'borrower',
          attributes: ['id', 'firstName', 'lastName', 'profilePhoto', 'phone', 'whatsapp', 'email', 'city', 'state', 'trustScore', 'repaymentScore', 'averageRating', 'totalRatings', 'isIdVerified', 'isFaceVerified', 'createdAt']
        },
        {
          model: User,
          as: 'lender',
          attributes: ['id', 'firstName', 'lastName', 'profilePhoto', 'phone', 'whatsapp', 'email', 'city', 'state', 'trustScore', 'averageRating']
        },
        {
          model: Repayment,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found'
      });
    }

    // Hide contact info if not shared
    if (!loanRequest.isContactShared) {
      if (loanRequest.borrower) {
        loanRequest.borrower.phone = null;
        loanRequest.borrower.whatsapp = null;
        loanRequest.borrower.email = null;
      }
      if (loanRequest.lender) {
        loanRequest.lender.phone = null;
        loanRequest.lender.whatsapp = null;
        loanRequest.lender.email = null;
      }
    }

    res.json({
      success: true,
      data: loanRequest
    });
  } catch (error) {
    console.error('Get loan request details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get loan request details',
      error: error.message
    });
  }
};

// Accept loan request (Lender)
exports.acceptLoanRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const lenderId = req.user.id;

    const loanRequest = await LoanRequest.findByPk(id, {
      include: [{ model: User, as: 'borrower' }]
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found'
      });
    }

    if (loanRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This loan request is no longer available'
      });
    }

    // Check lender's available balance
    const lender = await User.findByPk(lenderId);
    if (parseFloat(lender.availableBalance) < parseFloat(loanRequest.amount)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient lending balance'
      });
    }

    // Calculate due date and total repayable
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + loanRequest.duration);
    
    const interest = (parseFloat(loanRequest.amount) * parseFloat(loanRequest.interestRate) * loanRequest.duration) / (365 * 100);
    const totalRepayable = parseFloat(loanRequest.amount) + interest;

    // Update loan request
    loanRequest.lenderId = lenderId;
    loanRequest.status = 'accepted';
    loanRequest.acceptedAt = new Date();
    loanRequest.dueDate = dueDate;
    loanRequest.totalRepayable = totalRepayable.toFixed(2);
    loanRequest.remainingAmount = totalRepayable.toFixed(2);
    loanRequest.isContactShared = true;
    loanRequest.contactSharedAt = new Date();
    await loanRequest.save();

    // Update lender's available balance
    lender.availableBalance = parseFloat(lender.availableBalance) - parseFloat(loanRequest.amount);
    await lender.save();

    // Notify borrower
    const template = notificationTemplates.loanAccepted(`${lender.firstName} ${lender.lastName}`, loanRequest.amount);
    await createNotification({
      userId: loanRequest.borrowerId,
      type: 'loan_accepted',
      title: template.title,
      message: template.message,
      relatedId: loanRequest.id,
      relatedType: 'LoanRequest'
    });

    // Log activity
    await ActivityLog.create({
      userId: lenderId,
      action: 'ACCEPT_LOAN_REQUEST',
      description: `Accepted loan request of ₹${loanRequest.amount}`,
      entityType: 'LoanRequest',
      entityId: loanRequest.id
    });

    // Notify all admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'loan_accepted',
        title: 'Loan Request Accepted',
        message: `${lender.firstName} ${lender.lastName} accepted loan of ₹${loanRequest.amount} for ${loanRequest.borrower.firstName} ${loanRequest.borrower.lastName}`,
        relatedId: loanRequest.id,
        relatedType: 'LoanRequest'
      });
    }

    res.json({
      success: true,
      message: 'Loan request accepted successfully',
      data: loanRequest
    });
  } catch (error) {
    console.error('Accept loan request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept loan request',
      error: error.message
    });
  }
};

// Mark loan as fulfilled (Borrower confirms receiving money)
exports.markFulfilled = async (req, res) => {
  try {
    const { id } = req.params;
    const borrowerId = req.user.id;

    const loanRequest = await LoanRequest.findOne({
      where: { id, borrowerId }
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found'
      });
    }

    if (loanRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'This loan request cannot be marked as fulfilled'
      });
    }

    loanRequest.status = 'in_progress';
    loanRequest.fulfilledAt = new Date();
    await loanRequest.save();

    // Update borrower's total borrowed
    const borrower = await User.findByPk(borrowerId);
    borrower.totalBorrowed = parseFloat(borrower.totalBorrowed) + parseFloat(loanRequest.amount);
    await borrower.save();

    // Update lender's total lent
    const lender = await User.findByPk(loanRequest.lenderId);
    lender.totalLent = parseFloat(lender.totalLent) + parseFloat(loanRequest.amount);
    await lender.save();

    // Notify lender
    const template = notificationTemplates.loanFulfilled(`${borrower.firstName} ${borrower.lastName}`, loanRequest.amount);
    await createNotification({
      userId: loanRequest.lenderId,
      type: 'loan_fulfilled',
      title: template.title,
      message: template.message,
      relatedId: loanRequest.id,
      relatedType: 'LoanRequest'
    });

    // Notify all admins
    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'loan_fulfilled',
        title: 'Loan Fulfilled',
        message: `${borrower.firstName} ${borrower.lastName} confirmed receiving ₹${loanRequest.amount} from ${lender.firstName} ${lender.lastName}`,
        relatedId: loanRequest.id,
        relatedType: 'LoanRequest'
      });
    }

    res.json({
      success: true,
      message: 'Loan marked as fulfilled',
      data: loanRequest
    });
  } catch (error) {
    console.error('Mark fulfilled error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark loan as fulfilled',
      error: error.message
    });
  }
};

// Record repayment (Lender marks payment received)
exports.recordRepayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionReference, remarks } = req.body;
    const lenderId = req.user.id;

    const loanRequest = await LoanRequest.findOne({
      where: { id, lenderId, status: 'in_progress' }
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found or not in progress'
      });
    }

    // Check if payment is late
    const isLate = new Date() > new Date(loanRequest.dueDate);
    const daysLate = isLate ? Math.ceil((new Date() - new Date(loanRequest.dueDate)) / (1000 * 60 * 60 * 24)) : 0;

    // Create repayment record
    const repayment = await Repayment.create({
      loanRequestId: id,
      borrowerId: loanRequest.borrowerId,
      lenderId,
      amount,
      paymentMethod,
      transactionReference,
      remarks,
      status: 'confirmed',
      confirmedByLender: true,
      confirmedAt: new Date(),
      isLate,
      daysLate
    });

    // Update loan request
    loanRequest.amountRepaid = parseFloat(loanRequest.amountRepaid) + parseFloat(amount);
    loanRequest.remainingAmount = parseFloat(loanRequest.totalRepayable) - parseFloat(loanRequest.amountRepaid);
    loanRequest.remarks = remarks || loanRequest.remarks;

    // Check if fully repaid
    if (loanRequest.remainingAmount <= 0) {
      loanRequest.status = 'completed';
      loanRequest.completedAt = new Date();

      // Return funds to lender's available balance
      const lender = await User.findByPk(lenderId);
      lender.availableBalance = parseFloat(lender.availableBalance) + parseFloat(loanRequest.totalRepayable);
      await lender.save();

      // Update borrower's scores
      await calculateRepaymentScore(loanRequest.borrowerId);
      await calculateTrustScore(loanRequest.borrowerId);
    }

    await loanRequest.save();

    // Notify borrower
    const borrower = await User.findByPk(loanRequest.borrowerId);
    await createNotification({
      userId: loanRequest.borrowerId,
      type: 'payment_received',
      title: 'Payment Recorded',
      message: `Your payment of ₹${amount} has been recorded`,
      relatedId: loanRequest.id,
      relatedType: 'LoanRequest'
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: { repayment, loanRequest }
    });
  } catch (error) {
    console.error('Record repayment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record repayment',
      error: error.message
    });
  }
};

// Rate and review (after loan completion)
exports.rateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    const loanRequest = await LoanRequest.findByPk(id);

    if (!loanRequest || loanRequest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed loans'
      });
    }

    let targetUserId;

    if (userId === loanRequest.borrowerId) {
      // Borrower rating lender
      if (loanRequest.lenderRating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this lender'
        });
      }
      loanRequest.lenderRating = rating;
      loanRequest.lenderReview = review;
      targetUserId = loanRequest.lenderId;
    } else if (userId === loanRequest.lenderId) {
      // Lender rating borrower
      if (loanRequest.borrowerRating) {
        return res.status(400).json({
          success: false,
          message: 'You have already rated this borrower'
        });
      }
      loanRequest.borrowerRating = rating;
      loanRequest.borrowerReview = review;
      targetUserId = loanRequest.borrowerId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this loan'
      });
    }

    await loanRequest.save();

    // Update target user's rating
    await updateUserRating(targetUserId, rating);

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};

// Get borrower's loan requests
exports.getMyBorrowRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const borrowerId = req.user.id;

    const where = { borrowerId };
    if (status) where.status = status;

    const { count, rows } = await LoanRequest.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'lender',
        attributes: ['id', 'firstName', 'lastName', 'profilePhoto', 'phone', 'whatsapp', 'trustScore']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        requests: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get borrow requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get loan requests',
      error: error.message
    });
  }
};

// Get lender's lending history
exports.getMyLendingHistory = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const lenderId = req.user.id;

    const where = { lenderId };
    if (status) where.status = status;

    const { count, rows } = await LoanRequest.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'borrower',
        attributes: ['id', 'firstName', 'lastName', 'profilePhoto', 'phone', 'whatsapp', 'trustScore', 'repaymentScore']
      }, {
        model: Repayment
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        loans: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get lending history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lending history',
      error: error.message
    });
  }
};

// Cancel loan request (Borrower)
exports.cancelLoanRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const borrowerId = req.user.id;

    const loanRequest = await LoanRequest.findOne({
      where: { id, borrowerId, status: 'pending' }
    });

    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found or cannot be cancelled'
      });
    }

    loanRequest.status = 'rejected';
    loanRequest.remarks = 'Cancelled by borrower';
    await loanRequest.save();

    res.json({
      success: true,
      message: 'Loan request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel loan request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel loan request',
      error: error.message
    });
  }
};
