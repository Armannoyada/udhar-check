const { User, LoanRequest, Repayment } = require('../models/associations');
const { Op } = require('sequelize');

/**
 * Calculate trust score based on user behavior
 * Score range: 0-100
 */
const calculateTrustScore = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return 50;

    let score = 50; // Base score

    // Factor 1: Profile completeness (+10 points max)
    if (user.isIdVerified) score += 5;
    if (user.isFaceVerified) score += 5;

    // Factor 2: Account age (+10 points max)
    const accountAge = (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
    if (accountAge > 365) score += 10;
    else if (accountAge > 180) score += 7;
    else if (accountAge > 90) score += 5;
    else if (accountAge > 30) score += 3;

    // Factor 3: Transaction history (+20 points max)
    let completedLoans;
    if (user.role === 'borrower') {
      completedLoans = await LoanRequest.count({
        where: { borrowerId: userId, status: 'completed' }
      });
    } else if (user.role === 'lender') {
      completedLoans = await LoanRequest.count({
        where: { lenderId: userId, status: 'completed' }
      });
    }
    
    if (completedLoans >= 20) score += 20;
    else if (completedLoans >= 10) score += 15;
    else if (completedLoans >= 5) score += 10;
    else if (completedLoans >= 1) score += 5;

    // Factor 4: Report penalty (-20 points max)
    score -= Math.min(user.reportCount * 4, 20);

    // Factor 5: Average rating (+10 points max)
    if (user.totalRatings > 0) {
      const ratingBonus = (user.averageRating - 3) * 5;
      score += ratingBonus;
    }

    // Ensure score stays within 0-100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Update user's trust score
    await User.update({ trustScore: score }, { where: { id: userId } });

    return score;
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return 50;
  }
};

/**
 * Calculate repayment score based on payment history
 * Score range: 0-100
 */
const calculateRepaymentScore = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'borrower') return 50;

    let score = 50; // Base score

    // Get all loan requests where user is borrower
    const loans = await LoanRequest.findAll({
      where: { 
        borrowerId: userId,
        status: { [Op.in]: ['completed', 'in_progress', 'defaulted'] }
      },
      include: [{ model: Repayment }]
    });

    if (loans.length === 0) return 50;

    // Factor 1: On-time payment ratio (+25 points max)
    const allRepayments = await Repayment.findAll({
      where: { borrowerId: userId }
    });
    
    const onTimePayments = allRepayments.filter(r => !r.isLate).length;
    const totalPayments = allRepayments.length;
    
    if (totalPayments > 0) {
      const onTimeRatio = onTimePayments / totalPayments;
      score += Math.round(onTimeRatio * 25);
    }

    // Factor 2: Completion rate (+15 points max)
    const completedLoans = loans.filter(l => l.status === 'completed').length;
    const defaultedLoans = loans.filter(l => l.status === 'defaulted').length;
    
    if (loans.length > 0) {
      const completionRate = completedLoans / loans.length;
      score += Math.round(completionRate * 15);
    }

    // Factor 3: Default penalty (-30 points max)
    score -= Math.min(defaultedLoans * 10, 30);

    // Factor 4: Average days late penalty (-10 points max)
    const latePayments = allRepayments.filter(r => r.isLate);
    if (latePayments.length > 0) {
      const avgDaysLate = latePayments.reduce((sum, r) => sum + r.daysLate, 0) / latePayments.length;
      score -= Math.min(Math.round(avgDaysLate), 10);
    }

    // Factor 5: Total borrowed amount bonus (+10 points max for consistent borrower)
    const totalBorrowed = parseFloat(user.totalBorrowed);
    if (totalBorrowed > 0 && completedLoans >= 5) {
      score += 10;
    } else if (completedLoans >= 2) {
      score += 5;
    }

    // Ensure score stays within 0-100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Update user's repayment score
    await User.update({ repaymentScore: score }, { where: { id: userId } });

    return score;
  } catch (error) {
    console.error('Error calculating repayment score:', error);
    return 50;
  }
};

/**
 * Get credit history for a borrower
 */
const getCreditHistory = async (borrowerId) => {
  try {
    const loans = await LoanRequest.findAll({
      where: { borrowerId },
      include: [
        { model: User, as: 'lender', attributes: ['id', 'firstName', 'lastName'] },
        { model: Repayment }
      ],
      order: [['createdAt', 'DESC']]
    });

    const history = loans.map(loan => ({
      id: loan.id,
      amount: loan.amount,
      status: loan.status,
      lender: loan.lender ? `${loan.lender.firstName} ${loan.lender.lastName}` : null,
      createdAt: loan.createdAt,
      completedAt: loan.completedAt,
      totalRepaid: loan.Repayments?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0,
      latePayments: loan.Repayments?.filter(r => r.isLate).length || 0
    }));

    return history;
  } catch (error) {
    console.error('Error getting credit history:', error);
    return [];
  }
};

/**
 * Update user rating after a loan is completed
 */
const updateUserRating = async (userId, newRating) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) return;

    const totalRatings = user.totalRatings + 1;
    const currentTotal = parseFloat(user.averageRating) * user.totalRatings;
    const averageRating = (currentTotal + newRating) / totalRatings;

    await User.update(
      { 
        totalRatings, 
        averageRating: averageRating.toFixed(2) 
      }, 
      { where: { id: userId } }
    );

    // Recalculate trust score
    await calculateTrustScore(userId);
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
};

module.exports = {
  calculateTrustScore,
  calculateRepaymentScore,
  getCreditHistory,
  updateUserRating
};
