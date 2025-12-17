import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiClock, FiCheckCircle, FiXCircle, FiLogOut } from 'react-icons/fi';
import './VerificationPending.css';

const VerificationPending = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusIcon = () => {
    if (user?.verificationStatus === 'pending') {
      return <FiClock className="status-icon pending" />;
    } else if (user?.verificationStatus === 'approved') {
      return <FiCheckCircle className="status-icon approved" />;
    } else if (user?.verificationStatus === 'rejected') {
      return <FiXCircle className="status-icon rejected" />;
    }
  };

  const getStatusMessage = () => {
    if (user?.verificationStatus === 'pending') {
      return {
        title: 'Verification Pending',
        message: 'Your account is under review by our admin team. This usually takes 24-48 hours. We will notify you once your account is verified.',
        color: 'var(--warning)'
      };
    } else if (user?.verificationStatus === 'approved') {
      return {
        title: 'Account Verified!',
        message: 'Your account has been verified successfully. Redirecting to dashboard...',
        color: 'var(--success)'
      };
    } else if (user?.verificationStatus === 'rejected') {
      // Check if it's a partial rejection (rejectedDocuments exists and has items)
      const hasRejectedDocs = user?.rejectedDocuments && Array.isArray(user.rejectedDocuments) && user.rejectedDocuments.length > 0;
      
      return {
        title: 'Verification Rejected',
        message: hasRejectedDocs 
          ? 'Some of your documents need to be resubmitted. Please update the rejected documents below.'
          : (user?.rejectionReason || 'Your verification was rejected. Please contact support for more information.'),
        color: 'var(--danger)'
      };
    }
  };

  const status = getStatusMessage();

  return (
    <div className="verification-pending-page">
      <div className="verification-container">
        <div className="verification-header">
          <h1 className="brand-name">उधार CHECK</h1>
        </div>

        <div className="verification-content">
          {getStatusIcon()}
          
          <h2 style={{ color: status.color }}>{status.title}</h2>
          <p className="verification-message">{status.message}</p>

          {user?.verificationStatus === 'pending' && (
            <div className="verification-details">
              <h3>Documents Under Review:</h3>
              <ul>
                <li>
                  <span>Identity Verification</span>
                  <span className="status-badge pending">Under Review</span>
                </li>
                <li>
                  <span>Address Verification</span>
                  <span className="status-badge pending">Under Review</span>
                </li>
                <li>
                  <span>Selfie Verification</span>
                  <span className="status-badge pending">Under Review</span>
                </li>
              </ul>
            </div>
          )}

          {user?.verificationStatus === 'rejected' && (
            <div className="verification-details rejection-details">
              {user?.rejectedDocuments && Array.isArray(user.rejectedDocuments) && user.rejectedDocuments.length > 0 ? (
                <>
                  <h3>Rejected Documents:</h3>
                  <div className="rejected-documents-list">
                    {user.rejectedDocuments.map((rejection, index) => (
                      <div key={index} className="rejected-document-item">
                        <div className="rejection-header">
                          <FiXCircle className="rejection-icon" />
                          <strong>
                            {rejection.type === 'identity' && 'Identity Document'}
                            {rejection.type === 'address' && 'Address Verification'}
                            {rejection.type === 'selfie' && 'Selfie Photo'}
                          </strong>
                        </div>
                        <div className="rejection-reason-box">
                          {rejection.reason || 'No specific reason provided.'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/onboarding')}
                  >
                    Update Rejected Documents
                  </button>
                </>
              ) : (
                <>
                  <h3>Reason for Rejection:</h3>
                  <div className="rejection-reason">
                    {user?.rejectionReason || 'No specific reason provided. Please contact support.'}
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/onboarding')}
                  >
                    Restart Onboarding
                  </button>
                </>
              )}
            </div>
          )}

          <div className="verification-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleLogout}
            >
              <FiLogOut /> Logout
            </button>
          </div>

          <div className="verification-support">
            <p>Need help? Contact us at <a href="mailto:support@udhar.com">support@udhar.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
