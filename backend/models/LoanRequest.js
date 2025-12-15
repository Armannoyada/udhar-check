const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const LoanRequest = sequelize.define('LoanRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  borrowerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  purpose: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // in days
    allowNull: false
  },
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'pending',      // Request created, waiting for lenders
      'accepted',     // Lender accepted the request
      'rejected',     // Lender rejected or borrower cancelled
      'fulfilled',    // Money received by borrower
      'in_progress',  // Repayment in progress
      'completed',    // Fully repaid
      'defaulted',    // Borrower defaulted
      'disputed'      // Under dispute
    ),
    defaultValue: 'pending'
  },
  lenderId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  acceptedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fulfilledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalRepayable: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  amountRepaid: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  isContactShared: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  contactSharedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  borrowerRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  borrowerReview: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lenderRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  lenderReview: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'loan_requests',
  timestamps: true
});

module.exports = LoanRequest;
