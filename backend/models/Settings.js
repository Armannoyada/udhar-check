const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'settings',
  timestamps: true
});

// Default settings to seed
Settings.defaultSettings = [
  {
    key: 'max_transaction_amount',
    value: '100000',
    description: 'Maximum amount for a single transaction',
    type: 'number',
    category: 'transactions'
  },
  {
    key: 'min_transaction_amount',
    value: '500',
    description: 'Minimum amount for a single transaction',
    type: 'number',
    category: 'transactions'
  },
  {
    key: 'max_loan_duration_days',
    value: '365',
    description: 'Maximum loan duration in days',
    type: 'number',
    category: 'transactions'
  },
  {
    key: 'min_loan_duration_days',
    value: '7',
    description: 'Minimum loan duration in days',
    type: 'number',
    category: 'transactions'
  },
  {
    key: 'default_interest_rate',
    value: '10',
    description: 'Default interest rate percentage',
    type: 'number',
    category: 'transactions'
  },
  {
    key: 'payment_reminder_days',
    value: '[3, 1, 0]',
    description: 'Days before due date to send reminders',
    type: 'json',
    category: 'notifications'
  },
  {
    key: 'enable_sms_notifications',
    value: 'true',
    description: 'Enable SMS notifications',
    type: 'boolean',
    category: 'notifications'
  },
  {
    key: 'enable_whatsapp_notifications',
    value: 'true',
    description: 'Enable WhatsApp notifications',
    type: 'boolean',
    category: 'notifications'
  },
  {
    key: 'enable_email_notifications',
    value: 'true',
    description: 'Enable email notifications',
    type: 'boolean',
    category: 'notifications'
  },
  {
    key: 'require_id_verification',
    value: 'true',
    description: 'Require government ID verification',
    type: 'boolean',
    category: 'verification'
  },
  {
    key: 'require_face_verification',
    value: 'true',
    description: 'Require face/selfie verification',
    type: 'boolean',
    category: 'verification'
  },
  {
    key: 'auto_block_report_threshold',
    value: '5',
    description: 'Number of reports to auto-block user',
    type: 'number',
    category: 'moderation'
  },
  {
    key: 'trust_score_default',
    value: '50',
    description: 'Default trust score for new users',
    type: 'number',
    category: 'scoring'
  },
  {
    key: 'repayment_score_default',
    value: '50',
    description: 'Default repayment score for new users',
    type: 'number',
    category: 'scoring'
  }
];

module.exports = Settings;
