const sequelize = require('./index');
const User = require('./User');
const LoanRequest = require('./LoanRequest');
const Repayment = require('./Repayment');
const Report = require('./Report');
const Notification = require('./Notification');
const { Dispute, DisputeNote } = require('./Dispute');
const Settings = require('./Settings');
const ActivityLog = require('./ActivityLog');

// User associations
User.hasMany(LoanRequest, { as: 'borrowerLoans', foreignKey: 'borrowerId' });
User.hasMany(LoanRequest, { as: 'lenderLoans', foreignKey: 'lenderId' });
User.hasMany(Repayment, { as: 'borrowerRepayments', foreignKey: 'borrowerId' });
User.hasMany(Repayment, { as: 'lenderRepayments', foreignKey: 'lenderId' });
User.hasMany(Report, { as: 'reportsFiled', foreignKey: 'reporterId' });
User.hasMany(Report, { as: 'reportsReceived', foreignKey: 'reportedUserId' });
User.hasMany(Notification, { foreignKey: 'userId' });
User.hasMany(Dispute, { as: 'disputesRaised', foreignKey: 'raisedById' });
User.hasMany(Dispute, { as: 'disputesAgainst', foreignKey: 'againstUserId' });
User.hasMany(ActivityLog, { foreignKey: 'userId' });

// Loan Request associations
LoanRequest.belongsTo(User, { as: 'borrower', foreignKey: 'borrowerId' });
LoanRequest.belongsTo(User, { as: 'lender', foreignKey: 'lenderId' });
LoanRequest.hasMany(Repayment, { foreignKey: 'loanRequestId' });
LoanRequest.hasMany(Report, { foreignKey: 'loanRequestId' });
LoanRequest.hasMany(Dispute, { foreignKey: 'loanRequestId' });

// Repayment associations
Repayment.belongsTo(LoanRequest, { foreignKey: 'loanRequestId' });
Repayment.belongsTo(User, { as: 'borrower', foreignKey: 'borrowerId' });
Repayment.belongsTo(User, { as: 'lender', foreignKey: 'lenderId' });

// Report associations
Report.belongsTo(User, { as: 'reporter', foreignKey: 'reporterId' });
Report.belongsTo(User, { as: 'reportedUser', foreignKey: 'reportedUserId' });
Report.belongsTo(LoanRequest, { foreignKey: 'loanRequestId' });
Report.belongsTo(User, { as: 'resolver', foreignKey: 'resolvedBy' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId' });

// Dispute associations
Dispute.belongsTo(LoanRequest, { foreignKey: 'loanRequestId' });
Dispute.belongsTo(User, { as: 'raisedBy', foreignKey: 'raisedById' });
Dispute.belongsTo(User, { as: 'againstUser', foreignKey: 'againstUserId' });
Dispute.belongsTo(User, { as: 'resolver', foreignKey: 'resolvedBy' });
Dispute.hasMany(DisputeNote, { foreignKey: 'disputeId' });

// Dispute Note associations
DisputeNote.belongsTo(Dispute, { foreignKey: 'disputeId' });
DisputeNote.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

// Activity Log associations
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

// Settings associations
Settings.belongsTo(User, { as: 'updater', foreignKey: 'updatedBy' });

module.exports = {
  sequelize,
  User,
  LoanRequest,
  Repayment,
  Report,
  Notification,
  Dispute,
  DisputeNote,
  Settings,
  ActivityLog
};
