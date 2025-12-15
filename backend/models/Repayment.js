const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Repayment = sequelize.define('Repayment', {
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
  borrowerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lenderId: {
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
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'bank_transfer', 'upi', 'cheque', 'other'),
    allowNull: true
  },
  transactionReference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'disputed'),
    defaultValue: 'pending'
  },
  confirmedByLender: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isLate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  daysLate: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'repayments',
  timestamps: true
});

module.exports = Repayment;
