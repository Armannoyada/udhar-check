import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loansAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPhone, FiMessageCircle, FiMail, FiAlertTriangle, FiCheck, FiStar } from 'react-icons/fi';
import './LoanDetails.css';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRepaymentModal, setShowRepaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [repaymentData, setRepaymentData] = useState({
    amount: '',
    paymentMethod: 'upi',
    transactionReference: '',
    remarks: ''
  });
  const [ratingData, setRatingData] = useState({
    rating: 5,
    review: ''
  });

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      const response = await loansAPI.getDetails(id);
      setLoan(response.data.data);
    } catch (error) {
      console.error('Failed to fetch loan details:', error);
      toast.error('Failed to load loan details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', label: 'Pending' },
      accepted: { class: 'badge-info', label: 'Accepted' },
      in_progress: { class: 'badge-primary', label: 'In Progress' },
      completed: { class: 'badge-success', label: 'Completed' },
      defaulted: { class: 'badge-danger', label: 'Defaulted' },
      disputed: { class: 'badge-danger', label: 'Disputed' }
    };
    return badges[status] || { class: 'badge-gray', label: status };
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  const handleAcceptLoan = async () => {
    setActionLoading(true);
    try {
      await loansAPI.acceptRequest(id);
      toast.success('Loan request accepted!');
      fetchLoanDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept loan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkFulfilled = async () => {
    setActionLoading(true);
    try {
      await loansAPI.markFulfilled(id);
      toast.success('Loan marked as fulfilled!');
      fetchLoanDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as fulfilled');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordRepayment = async (e) => {
    e.preventDefault();
    if (!repaymentData.amount) {
      toast.error('Please enter amount');
      return;
    }

    setActionLoading(true);
    try {
      await loansAPI.recordRepayment(id, repaymentData);
      toast.success('Repayment recorded successfully!');
      setShowRepaymentModal(false);
      setRepaymentData({ amount: '', paymentMethod: 'upi', transactionReference: '', remarks: '' });
      fetchLoanDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record repayment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await loansAPI.rateUser(id, ratingData);
      toast.success('Rating submitted!');
      setShowRatingModal(false);
      fetchLoanDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="card">
        <div className="card-body empty-state">
          <h3>Loan not found</h3>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const isLender = user?.role === 'lender';
  const isBorrower = user?.role === 'borrower';
  const otherUser = isLender ? loan.borrower : loan.lender;
  const status = getStatusBadge(loan.status);
  const canAccept = isLender && loan.status === 'pending';
  const canMarkFulfilled = isBorrower && loan.status === 'accepted';
  const canRecordRepayment = isLender && loan.status === 'in_progress';
  const canRate = loan.status === 'completed' && (
    (isLender && !loan.borrowerRating) || (isBorrower && !loan.lenderRating)
  );

  return (
    <div className="loan-details-page">
      <div className="page-header">
        <h1 className="page-title">Loan Details</h1>
        <span className={`badge ${status.class}`} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
          {status.label}
        </span>
      </div>

      <div className="details-grid">
        {/* Main Info Card */}
        <div className="card">
          <div className="card-body">
            <div className="loan-amount-display">
              <h2>{formatCurrency(loan.amount)}</h2>
              <p>Loan Amount</p>
            </div>

            <div className="loan-info-grid">
              <div className="info-item">
                <span className="info-label">Duration</span>
                <span className="info-value">{loan.duration} days</span>
              </div>
              <div className="info-item">
                <span className="info-label">Interest Rate</span>
                <span className="info-value">{loan.interestRate}%</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Repayable</span>
                <span className="info-value">{formatCurrency(loan.totalRepayable)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Due Date</span>
                <span className="info-value">
                  {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Amount Repaid</span>
                <span className="info-value">{formatCurrency(loan.amountRepaid)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Remaining</span>
                <span className="info-value">{formatCurrency(loan.remainingAmount)}</span>
              </div>
            </div>

            <div className="purpose-box">
              <strong>Purpose:</strong>
              <p>{loan.purpose}</p>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {canAccept && (
                <button 
                  className="btn btn-success btn-lg" 
                  onClick={handleAcceptLoan}
                  disabled={actionLoading}
                >
                  {actionLoading ? <span className="spinner"></span> : 'Accept Loan Request'}
                </button>
              )}

              {canMarkFulfilled && (
                <button 
                  className="btn btn-success btn-lg" 
                  onClick={handleMarkFulfilled}
                  disabled={actionLoading}
                >
                  {actionLoading ? <span className="spinner"></span> : 'Confirm Money Received'}
                </button>
              )}

              {canRecordRepayment && (
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={() => setShowRepaymentModal(true)}
                >
                  Record Repayment
                </button>
              )}

              {canRate && (
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={() => setShowRatingModal(true)}
                >
                  <FiStar /> Rate {isLender ? 'Borrower' : 'Lender'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User Info Card */}
        {otherUser && (
          <div className="card">
            <div className="card-header">
              <h3>{isLender ? 'Borrower' : 'Lender'} Details</h3>
            </div>
            <div className="card-body">
              <div className="user-profile">
                <div className="avatar avatar-lg avatar-placeholder">
                  {otherUser.profilePhoto ? (
                    <img src={`http://localhost:5000${otherUser.profilePhoto}`} alt="" />
                  ) : (
                    `${otherUser.firstName?.[0]}${otherUser.lastName?.[0]}`
                  )}
                </div>
                <div className="user-info">
                  <h3>{otherUser.firstName} {otherUser.lastName}</h3>
                  <p>{otherUser.city}, {otherUser.state}</p>
                </div>
              </div>

              {/* Scores */}
              <div className="user-scores">
                <div className={`score-item ${getScoreClass(otherUser.trustScore)}`}>
                  <span className="score-value">{otherUser.trustScore || 50}</span>
                  <span className="score-label">Trust Score</span>
                </div>
                {isLender && (
                  <div className={`score-item ${getScoreClass(otherUser.repaymentScore)}`}>
                    <span className="score-value">{otherUser.repaymentScore || 50}</span>
                    <span className="score-label">Repayment Score</span>
                  </div>
                )}
                <div className="score-item" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <span className="score-value" style={{ color: 'var(--warning)' }}>
                    ⭐ {otherUser.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="score-label">{otherUser.totalRatings || 0} Ratings</span>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="verification-badges">
                {otherUser.isIdVerified && (
                  <span className="verification-badge verified">
                    <FiCheck /> ID Verified
                  </span>
                )}
                {otherUser.isFaceVerified && (
                  <span className="verification-badge verified">
                    <FiCheck /> Face Verified
                  </span>
                )}
              </div>

              {/* Contact Info (only if shared) */}
              {loan.isContactShared && (
                <div className="contact-info">
                  <h4>Contact Information</h4>
                  <div className="contact-item">
                    <FiPhone />
                    <a href={`tel:${otherUser.phone}`}>{otherUser.phone}</a>
                  </div>
                  {otherUser.whatsapp && (
                    <div className="contact-item">
                      <FiMessageCircle />
                      <a href={`https://wa.me/${otherUser.whatsapp}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    </div>
                  )}
                  {otherUser.email && (
                    <div className="contact-item">
                      <FiMail />
                      <a href={`mailto:${otherUser.email}`}>{otherUser.email}</a>
                    </div>
                  )}
                </div>
              )}

              {/* Report Link */}
              <div className="report-link">
                <Link to={`/${user?.role}/report/${otherUser.id}`} className="btn btn-outline">
                  <FiAlertTriangle /> Report User
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Repayment History */}
      {loan.Repayments && loan.Repayments.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h3>Repayment History</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.Repayments.map((repayment) => (
                  <tr key={repayment.id}>
                    <td>{new Date(repayment.paymentDate).toLocaleDateString()}</td>
                    <td><strong>{formatCurrency(repayment.amount)}</strong></td>
                    <td style={{ textTransform: 'uppercase' }}>{repayment.paymentMethod}</td>
                    <td>{repayment.transactionReference || '-'}</td>
                    <td>
                      <span className={`badge ${repayment.confirmedByLender ? 'badge-success' : 'badge-warning'}`}>
                        {repayment.confirmedByLender ? 'Confirmed' : 'Pending'}
                      </span>
                      {repayment.isLate && (
                        <span className="badge badge-danger" style={{ marginLeft: '0.5rem' }}>
                          {repayment.daysLate} days late
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {showRepaymentModal && (
        <div className="modal-overlay" onClick={() => setShowRepaymentModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record Repayment</h3>
              <button className="modal-close" onClick={() => setShowRepaymentModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleRecordRepayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter amount"
                    value={repaymentData.amount}
                    onChange={(e) => setRepaymentData({ ...repaymentData, amount: e.target.value })}
                    max={loan.remainingAmount}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-input form-select"
                    value={repaymentData.paymentMethod}
                    onChange={(e) => setRepaymentData({ ...repaymentData, paymentMethod: e.target.value })}
                  >
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Reference (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., UPI Ref Number"
                    value={repaymentData.transactionReference}
                    onChange={(e) => setRepaymentData({ ...repaymentData, transactionReference: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks (Optional)</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Any additional notes"
                    value={repaymentData.remarks}
                    onChange={(e) => setRepaymentData({ ...repaymentData, remarks: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRepaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={actionLoading}>
                  {actionLoading ? <span className="spinner"></span> : 'Confirm Repayment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Rate {isLender ? 'Borrower' : 'Lender'}</h3>
              <button className="modal-close" onClick={() => setShowRatingModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitRating}>
              <div className="modal-body">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${ratingData.rating >= star ? 'active' : ''}`}
                      onClick={() => setRatingData({ ...ratingData, rating: star })}
                    >
                      <FiStar size={32} />
                    </button>
                  ))}
                </div>
                <p className="rating-label">
                  {ratingData.rating === 5 && 'Excellent'}
                  {ratingData.rating === 4 && 'Good'}
                  {ratingData.rating === 3 && 'Average'}
                  {ratingData.rating === 2 && 'Poor'}
                  {ratingData.rating === 1 && 'Very Poor'}
                </p>

                <div className="form-group">
                  <label className="form-label">Review (Optional)</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Share your experience..."
                    value={ratingData.review}
                    onChange={(e) => setRatingData({ ...ratingData, review: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRatingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? <span className="spinner"></span> : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDetails;
