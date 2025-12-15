const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Dispute = sequelize.define('Dispute', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  loanRequestId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'loan_requests',
      key: 'id'
    }
  },
  raisedById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  againstUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  disputeType: {
    type: DataTypes.ENUM(
      'payment_not_received',
      'wrong_amount',
      'unauthorized_charge',
      'terms_violation',
      'other'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  disputedAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  evidence: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open', 'under_review', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  resolution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'disputes',
  timestamps: true
});

// Dispute Notes for audit trail
const DisputeNote = sequelize.define('DisputeNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  disputeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'disputes',
      key: 'id'
    }
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'dispute_notes',
  timestamps: true
});

module.exports = { Dispute, DisputeNote };
