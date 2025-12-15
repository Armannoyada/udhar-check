import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loansAPI } from '../../services/api';
import { FiFilter, FiSearch } from 'react-icons/fi';
import './Requests.css';

const LenderRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: 10,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await loansAPI.getPendingRequests(params);
      setRequests(response.data.data.requests || []);
      setPagination({
        ...pagination,
        total: response.data.data.total,
        totalPages: response.data.data.totalPages
      });
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getScoreClass = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="requests-page">
      <div className="page-header">
        <h1 className="page-title">Loan Requests</h1>
        <p className="page-subtitle">Browse and review loan requests from borrowers</p>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Min Amount</label>
          <input
            type="number"
            name="minAmount"
            className="form-input"
            placeholder="₹500"
            value={filters.minAmount}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Max Amount</label>
          <input
            type="number"
            name="maxAmount"
            className="form-input"
            placeholder="₹100000"
            value={filters.maxAmount}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select
            name="sortBy"
            className="form-input form-select"
            value={filters.sortBy}
            onChange={handleFilterChange}
          >
            <option value="createdAt">Date</option>
            <option value="amount">Amount</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Order</label>
          <select
            name="sortOrder"
            className="form-input form-select"
            value={filters.sortOrder}
            onChange={handleFilterChange}
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner" style={{ width: 40, height: 40 }}></div>
        </div>
      ) : requests.length > 0 ? (
        <>
          <div className="requests-grid">
            {requests.map((request) => (
              <div key={request.id} className="request-card card">
                <div className="card-body">
                  <div className="request-header">
                    <div className="borrower-info">
                      <div className="avatar avatar-lg avatar-placeholder">
                        {request.borrower?.profilePhoto ? (
                          <img src={`http://localhost:5000${request.borrower.profilePhoto}`} alt="" />
                        ) : (
                          `${request.borrower?.firstName?.[0]}${request.borrower?.lastName?.[0]}`
                        )}
                      </div>
                      <div>
                        <h3>{request.borrower?.firstName} {request.borrower?.lastName}</h3>
                        <p>{request.borrower?.city}, {request.borrower?.state}</p>
                      </div>
                    </div>
                    <div className="request-amount-badge">
                      {formatCurrency(request.amount)}
                    </div>
                  </div>

                  <div className="request-purpose">
                    <strong>Purpose:</strong> {request.purpose}
                  </div>

                  <div className="request-meta">
                    <div className="meta-item">
                      <span className="meta-label">Duration</span>
                      <span className="meta-value">{request.duration} days</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Interest</span>
                      <span className="meta-value">{request.interestRate}%</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Rating</span>
                      <span className="meta-value">⭐ {request.borrower?.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>

                  <div className="request-scores">
                    <div className={`score-box ${getScoreClass(request.borrower?.trustScore)}`}>
                      <span className="score-value">{request.borrower?.trustScore || 50}</span>
                      <span className="score-label">Trust</span>
                    </div>
                    <div className={`score-box ${getScoreClass(request.borrower?.repaymentScore)}`}>
                      <span className="score-value">{request.borrower?.repaymentScore || 50}</span>
                      <span className="score-label">Repayment</span>
                    </div>
                  </div>

                  <div className="request-actions">
                    <Link to={`/lender/loan/${request.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                      Review Request
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div className="card-body empty-state">
            <FiSearch size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">No Loan Requests Found</h3>
            <p className="empty-state-text">
              There are no pending loan requests at the moment. Check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LenderRequests;
