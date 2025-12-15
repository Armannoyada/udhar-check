const { Dispute, DisputeNote, LoanRequest, User, ActivityLog } = require('../models/associations');
const { createNotification } = require('../services/notificationService');

// Create dispute
exports.createDispute = async (req, res) => {
  try {
    const { loanRequestId, disputeType, description, disputedAmount } = req.body;
    const raisedById = req.user.id;

    const loanRequest = await LoanRequest.findByPk(loanRequestId);
    if (!loanRequest) {
      return res.status(404).json({
        success: false,
        message: 'Loan request not found'
      });
    }

    // Determine against user
    let againstUserId;
    if (raisedById === loanRequest.borrowerId) {
      againstUserId = loanRequest.lenderId;
    } else if (raisedById === loanRequest.lenderId) {
      againstUserId = loanRequest.borrowerId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this loan'
      });
    }

    // Handle evidence
    let evidence = null;
    if (req.files && req.files.length > 0) {
      evidence = req.files.map(f => `/uploads/evidence/${f.filename}`);
    }

    const dispute = await Dispute.create({
      loanRequestId,
      raisedById,
      againstUserId,
      disputeType,
      description,
      disputedAmount,
      evidence
    });

    // Update loan request status
    loanRequest.status = 'disputed';
    await loanRequest.save();

    // Notify the other party
    await createNotification({
      userId: againstUserId,
      type: 'general',
      title: 'Dispute Raised',
      message: 'A dispute has been raised for one of your loans',
      relatedId: dispute.id,
      relatedType: 'Dispute'
    });

    res.status(201).json({
      success: true,
      message: 'Dispute raised successfully',
      data: dispute
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dispute',
      error: error.message
    });
  }
};

// Get disputes
exports.getMyDisputes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    const where = {
      [require('sequelize').Op.or]: [
        { raisedById: userId },
        { againstUserId: userId }
      ]
    };
    if (status) where.status = status;

    const { count, rows } = await Dispute.findAndCountAll({
      where,
      include: [
        { model: User, as: 'raisedBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'againstUser', attributes: ['id', 'firstName', 'lastName'] },
        { model: LoanRequest, attributes: ['id', 'amount'] },
        { model: DisputeNote, include: [{ model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        disputes: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get disputes',
      error: error.message
    });
  }
};

// Add note to dispute
exports.addDisputeNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const authorId = req.user.id;

    const dispute = await Dispute.findByPk(id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check if user is part of the dispute
    if (dispute.raisedById !== authorId && 
        dispute.againstUserId !== authorId && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add notes to this dispute'
      });
    }

    let attachments = null;
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(f => `/uploads/evidence/${f.filename}`);
    }

    const disputeNote = await DisputeNote.create({
      disputeId: id,
      authorId,
      note,
      attachments
    });

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: disputeNote
    });
  } catch (error) {
    console.error('Add dispute note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
};
