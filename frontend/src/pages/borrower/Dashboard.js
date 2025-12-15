import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loansAPI, notificationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiClock, 
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiBell,
  FiArrowRight
} from 'react-icons/fi';
import './Dashboard.css';

const BorrowerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    activeBorrowings: 0,
    pendingRequests: 0,
    totalRepaid: 0,
    overdueCount: 0
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    amount: '',
    duration: '30',
    purpose: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [loansRes, notifRes] = await Promise.all([
        loansAPI.getMyBorrowings(),
        notificationsAPI.getAll()
      ]);

      // Handle different response structures
      let loans = [];
      if (loansRes.data.data) {
        // Check if it's paginated (has loans property) or direct array
        if (Array.isArray(loansRes.data.data)) {
          loans = loansRes.data.data;
        } else if (loansRes.data.data.loans) {
          loans = loansRes.data.data.loans;
        } else if (loansRes.data.data.requests) {
          loans = loansRes.data.data.requests;
        }
      }
      
      // Calculate stats
      const activeBorrowings = loans.filter(l => l.status === 'in_progress');
      const pendingRequests = loans.filter(l => l.status === 'pending');
      const completedLoans = loans.filter(l => l.status === 'completed');
      const overdueLoans = loans.filter(l => l.status === 'overdue');

      setStats({
        totalBorrowed: completedLoans.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0) +
                       activeBorrowings.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0),
        activeBorrowings: activeBorrowings.length,
        pendingRequests: pendingRequests.length,
        totalRepaid: completedLoans.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0),
        overdueCount: overdueLoans.length
      });

      setRecentLoans(loans.slice(0, 5));
      
      // Handle notifications response
      let notifications = [];
      if (notifRes.data.data) {
        if (Array.isArray(notifRes.data.data)) {
          notifications = notifRes.data.data;
        } else if (notifRes.data.data.notifications) {
          notifications = notifRes.data.data.notifications;
        }
      }
      setNotifications(notifications.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
      overdue: { class: 'badge-danger', label: 'Overdue' },
      defaulted: { class: 'badge-danger', label: 'Defaulted' },
      rejected: { class: 'badge-gray', label: 'Rejected' }
    };
    return badges[status] || { class: 'badge-gray', label: status };
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.amount || !requestForm.purpose) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await loansAPI.createRequest(requestForm);
      toast.success('Loan request submitted successfully!');
      setShowRequestModal(false);
      setRequestForm({ amount: '', duration: '30', purpose: '', description: '' });
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {user?.firstName}!</h1>
          <p>Manage your loan requests and track your repayments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
          <FiPlus /> Request Money
        </button>
      </div>

      {/* Score Cards */}
      <div className="score-overview">
        <div className={`score-card ${getScoreClass(user?.trustScore)}`}>
          <div className="score-circle">
            <span className="score-value">{user?.trustScore || 50}</span>
          </div>
          <div className="score-info">
            <h4>Trust Score</h4>
            <p>Based on your profile verification</p>
          </div>
        </div>
        <div className={`score-card ${getScoreClass(user?.repaymentScore)}`}>
          <div className="score-circle">
            <span className="score-value">{user?.repaymentScore || 50}</span>
          </div>
          <div className="score-info">
            <h4>Repayment Score</h4>
            <p>Based on your payment history</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalBorrowed)}</h3>
            <p>Total Borrowed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{stats.activeBorrowings}</h3>
            <p>Active Loans</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRepaid)}</h3>
            <p>Total Repaid</p>
          </div>
        </div>
      </div>

      {/* Alert for overdue */}
      {stats.overdueCount > 0 && (
        <div className="alert alert-danger">
          <FiAlertCircle />
          <span>
            You have <strong>{stats.overdueCount} overdue loan(s)</strong>. 
            Please make payments to avoid affecting your repayment score.
          </span>
          <Link to="/borrower/my-loans" className="alert-action">View Details</Link>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Loans */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Loan Activity</h3>
            <Link to="/borrower/my-loans" className="btn btn-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="card-body">
            {recentLoans.length === 0 ? (
              <div className="empty-state">
                <FiDollarSign size={48} />
                <h4>No loan activity yet</h4>
                <p>Submit your first loan request to get started</p>
                <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
                  <FiPlus /> Request Money
                </button>
              </div>
            ) : (
              <div className="loan-list">
                {recentLoans.map((loan) => (
                  <Link key={loan.id} to={`/borrower/loan/${loan.id}`} className="loan-item">
                    <div className="loan-info">
                      <h4>{formatCurrency(loan.amount)}</h4>
                      <p>{loan.purpose}</p>
                    </div>
                    <div className="loan-meta">
                      <span className={`badge ${getStatusBadge(loan.status).class}`}>
                        {getStatusBadge(loan.status).label}
                      </span>
                      <span className="loan-date">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h3>Notifications</h3>
            <Link to="/borrower/notifications" className="btn btn-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="card-body">
            {notifications.length === 0 ? (
              <div className="empty-state small">
                <FiBell size={32} />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                    <div className="notification-icon">
                      <FiBell />
                    </div>
                    <div className="notification-content">
                      <p>{notif.title}</p>
                      <span className="notification-time">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Money Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Request Money</h3>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitRequest}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter amount"
                      value={requestForm.amount}
                      onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                      min="100"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (Days) *</label>
                    <select
                      className="form-input form-select"
                      value={requestForm.duration}
                      onChange={(e) => setRequestForm({ ...requestForm, duration: e.target.value })}
                    >
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Purpose *</label>
                  <select
                    className="form-input form-select"
                    value={requestForm.purpose}
                    onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
                    required
                  >
                    <option value="">Select Purpose</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Education">Education</option>
                    <option value="Business">Business</option>
                    <option value="Personal">Personal</option>
                    <option value="Home Improvement">Home Improvement</option>
                    <option value="Travel">Travel</option>
                    <option value="Debt Consolidation">Debt Consolidation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Details</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Provide any additional details that might help lenders understand your request..."
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="info-box">
                  <h4>Before You Submit</h4>
                  <ul>
                    <li>Your trust score ({user?.trustScore || 50}) and repayment score ({user?.repaymentScore || 50}) will be visible to lenders</li>
                    <li>Complete your profile verification to increase your chances of approval</li>
                    <li>Interest rates are set by individual lenders</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner"></span> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowerDashboard;
