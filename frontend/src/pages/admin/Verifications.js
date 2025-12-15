import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiUser, 
  FiCheck, 
  FiX, 
  FiEye,
  FiImage,
  FiFileText,
  FiMapPin,
  FiCamera,
  FiAlertCircle
} from 'react-icons/fi';
import './Verifications.css';

const Verifications = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [verificationDecisions, setVerificationDecisions] = useState({
    identity: null, // 'approved' or 'rejected'
    address: null,
    selfie: null
  });
  const [rejectionReasons, setRejectionReasons] = useState({
    identity: '',
    address: '',
    selfie: ''
  });

  // Predefined rejection reasons for each document type
  const rejectionTemplates = {
    identity: [
      'Document is blurry or unreadable',
      'Document appears to be fake or tampered',
      'Document has expired',
      'Name on document does not match profile',
      'ID number does not match the format',
      'Document is partially visible or cut off',
      'Image quality is too low'
    ],
    address: [
      'Address information is incomplete',
      'Pincode does not match the state/city',
      'Address appears to be invalid or fake',
      'Address details are unclear or inconsistent'
    ],
    selfie: [
      'Face is not clearly visible',
      'Photo is too dark or overexposed',
      'Face does not match ID photo',
      'Multiple people in the photo',
      'Wearing sunglasses or face covering',
      'Photo appears to be manipulated'
    ]
  };

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({ 
        verificationStatus: 'pending',
        isOnboardingComplete: true 
      });
      setPendingUsers(response.data.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error);
      toast.error('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setVerificationDecisions({
      identity: null,
      address: null,
      selfie: null
    });
    setRejectionReasons({
      identity: '',
      address: '',
      selfie: ''
    });
  };

  const handleVerificationDecision = (type, decision) => {
    setVerificationDecisions({
      ...verificationDecisions,
      [type]: decision
    });
    
    // Clear rejection reason if approved
    if (decision === 'approved') {
      setRejectionReasons({
        ...rejectionReasons,
        [type]: ''
      });
    }
  };

  const selectRejectionReason = (type, reason) => {
    setRejectionReasons({
      ...rejectionReasons,
      [type]: reason
    });
  };

  const handleSubmitVerification = async () => {
    // Check if all decisions are made
    if (!verificationDecisions.identity || !verificationDecisions.address || !verificationDecisions.selfie) {
      toast.error('Please review all documents before submitting');
      return;
    }

    // Check if rejection reasons are provided for rejected items
    const rejectedItems = [];
    if (verificationDecisions.identity === 'rejected' && !rejectionReasons.identity.trim()) {
      rejectedItems.push('Identity');
    }
    if (verificationDecisions.address === 'rejected' && !rejectionReasons.address.trim()) {
      rejectedItems.push('Address');
    }
    if (verificationDecisions.selfie === 'rejected' && !rejectionReasons.selfie.trim()) {
      rejectedItems.push('Selfie');
    }

    if (rejectedItems.length > 0) {
      toast.error(`Please provide rejection reason for: ${rejectedItems.join(', ')}`);
      return;
    }

    try {
      // Count rejections
      const rejectedCount = Object.values(verificationDecisions).filter(d => d === 'rejected').length;
      
      if (rejectedCount === 3) {
        // All rejected - user must restart onboarding
        await adminAPI.rejectUserVerification(selectedUser.id, {
          reason: `All verifications rejected:\n- Identity: ${rejectionReasons.identity}\n- Address: ${rejectionReasons.address}\n- Selfie: ${rejectionReasons.selfie}`,
          restartOnboarding: true
        });
        toast.success('User verification rejected. User must restart onboarding.');
      } else if (rejectedCount > 0) {
        // Partial rejection - user can retake specific documents
        const partialRejections = [];
        if (verificationDecisions.identity === 'rejected') {
          partialRejections.push({ type: 'identity', reason: rejectionReasons.identity });
        }
        if (verificationDecisions.address === 'rejected') {
          partialRejections.push({ type: 'address', reason: rejectionReasons.address });
        }
        if (verificationDecisions.selfie === 'rejected') {
          partialRejections.push({ type: 'selfie', reason: rejectionReasons.selfie });
        }

        await adminAPI.partialRejectVerification(selectedUser.id, {
          rejections: partialRejections
        });
        toast.success('Verification decisions submitted. User can retake rejected documents.');
      } else {
        // All approved
        await adminAPI.approveUserVerification(selectedUser.id, { approve: true });
        toast.success('User verification approved successfully!');
      }

      setSelectedUser(null);
      fetchPendingVerifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit verification');
    }
  };

  const viewImage = (imageUrl, title) => {
    setCurrentImage({ url: imageUrl, title });
    setShowImageModal(true);
  };

  if (loading) {
    return <div className="loading">Loading pending verifications...</div>;
  }

  return (
    <div className="verifications-page">
      <div className="page-header">
        <h1 className="page-title">User Verifications</h1>
        <p className="page-subtitle">Review and approve user documents</p>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="empty-state">
          <FiCheck className="empty-icon" />
          <h3>No Pending Verifications</h3>
          <p>All users have been verified!</p>
        </div>
      ) : (
        <div className="verifications-layout">
          {/* Users List */}
          <div className="users-list">
            <h3>Pending Users ({pendingUsers.length})</h3>
            {pendingUsers.map(user => (
              <div 
                key={user.id} 
                className={`user-card ${selectedUser?.id === user.id ? 'active' : ''}`}
                onClick={() => handleViewUser(user)}
              >
                <div className="user-avatar">
                  {user.profilePhoto ? (
                    <img src={`http://localhost:5000${user.profilePhoto}`} alt={user.firstName} />
                  ) : (
                    <FiUser />
                  )}
                </div>
                <div className="user-info">
                  <h4>{user.firstName} {user.lastName}</h4>
                  <span className="user-role">{user.role}</span>
                  <small>{user.email}</small>
                </div>
                <FiEye className="view-icon" />
              </div>
            ))}
          </div>

          {/* Verification Details */}
          {selectedUser ? (
            <div className="verification-details">
              <div className="details-header">
                <h2>Verify Documents</h2>
                <div className="user-badge">
                  <FiUser /> {selectedUser.firstName} {selectedUser.lastName}
                </div>
              </div>

              <div className="verification-sections">
                {/* Identity Verification */}
                <div className="verification-section">
                  <div className="section-header">
                    <FiFileText className="section-icon" />
                    <h3>Identity Verification</h3>
                    <span className="doc-type">{selectedUser.governmentIdType?.toUpperCase()}</span>
                  </div>

                  <div className="document-info">
                    <div className="info-row">
                      <strong>ID Type:</strong>
                      <span>{selectedUser.governmentIdType || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <strong>ID Number:</strong>
                      <span>{selectedUser.governmentIdNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {selectedUser.governmentId && (
                    <div className="document-preview">
                      <img 
                        src={`http://localhost:5000${selectedUser.governmentId}`} 
                        alt="Government ID"
                        onClick={() => viewImage(`http://localhost:5000${selectedUser.governmentId}`, 'Government ID')}
                      />
                      <button 
                        className="view-full-btn"
                        onClick={() => viewImage(`http://localhost:5000${selectedUser.governmentId}`, 'Government ID')}
                      >
                        <FiEye /> View Full Size
                      </button>
                    </div>
                  )}

                  <div className="verification-decision">
                    <button 
                      className={`decision-btn approve ${verificationDecisions.identity === 'approved' ? 'active' : ''}`}
                      onClick={() => handleVerificationDecision('identity', 'approved')}
                    >
                      <FiCheck /> Approve
                    </button>
                    <button 
                      className={`decision-btn reject ${verificationDecisions.identity === 'rejected' ? 'active' : ''}`}
                      onClick={() => handleVerificationDecision('identity', 'rejected')}
                    >
                      <FiX /> Reject
                    </button>
                  </div>

                  {verificationDecisions.identity === 'rejected' && (
                    <div className="rejection-reason">
                      <label>Rejection Reason *</label>
                      <div className="reason-templates">
                        {rejectionTemplates.identity.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`template-btn ${rejectionReasons.identity === template ? 'selected' : ''}`}
                            onClick={() => selectRejectionReason('identity', template)}
                          >
                            {template}
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Or write a custom reason..."
                        value={rejectionReasons.identity}
                        onChange={(e) => setRejectionReasons({
                          ...rejectionReasons,
                          identity: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Address Verification */}
                <div className="verification-section">
                  <div className="section-header">
                    <FiMapPin className="section-icon" />
                    <h3>Address Verification</h3>
                  </div>

                  <div className="document-info">
                    <div className="info-row">
                      <strong>Address:</strong>
                      <span>{selectedUser.address || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <strong>City:</strong>
                      <span>{selectedUser.city || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <strong>State:</strong>
                      <span>{selectedUser.state || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <strong>Pincode:</strong>
                      <span>{selectedUser.pincode || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="verification-decision">
                    <button 
                      className={`decision-btn approve ${verificationDecisions.address === 'approved' ? 'active' : ''}`}
                      onClick={() => handleVerificationDecision('address', 'approved')}
                    >
                      <FiCheck /> Approve
                    </button>
                    <button 
                      className={`decision-btn reject ${verificationDecisions.address === 'rejected' ? 'active' : ''}`}
                      onClick={() => handleVerificationDecision('address', 'rejected')}
                    >
                      <FiX /> Reject
                    </button>
                  </div>

                  {verificationDecisions.address === 'rejected' && (
                    <div className="rejection-reason">
                      <label>Rejection Reason *</label>
                      <div className="reason-templates">
                        {rejectionTemplates.address.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`template-btn ${rejectionReasons.address === template ? 'selected' : ''}`}
                            onClick={() => selectRejectionReason('address', template)}
                          >
                            {template}
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Or write a custom reason..."
                        value={rejectionReasons.address}
                        onChange={(e) => setRejectionReasons({
                          ...rejectionReasons,
                          address: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                {/* Selfie Verification */}
                <div className="verification-section">
                  <div className="section-header">
                    <FiCamera className="section-icon" />
                    <h3>Selfie Verification</h3>
                  </div>

                  {selectedUser.selfiePhoto && (
                    <div className="document-preview">
                      <img 
                        src={`http://localhost:5000${selectedUser.selfiePhoto}`} 
                        alt="Selfie"
                        onClick={() => viewImage(`http://localhost:5000${selectedUser.selfiePhoto}`, 'Selfie')}
                      />
                      <button 
                        className="view-full-btn"
                        onClick={() => viewImage(`http://localhost:5000${selectedUser.selfiePhoto}`, 'Selfie')}
                      >
                        <FiEye /> View Full Size
                      </button>
                    </div>
                  )}

                  <div className="verification-decision">
                    <button 
                      className={`decision-btn approve ${verificationDecisions.selfie === 'approved' ? 'active' : ''}`}
                      onClick={() => handleVerificationDecision('selfie', 'approved')}
                    >
                      <FiCheck /> Approve
                    </button>
                    <button 
                      className={`decision-btn reject ${verificationDecisions.selfie === 'rejected' ? 'active' : ''}`}
                      onClick={() => handleVerificationDecision('selfie', 'rejected')}
                    >
                      <FiX /> Reject
                    </button>
                  </div>

                  {verificationDecisions.selfie === 'rejected' && (
                    <div className="rejection-reason">
                      <label>Rejection Reason *</label>
                      <div className="reason-templates">
                        {rejectionTemplates.selfie.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`template-btn ${rejectionReasons.selfie === template ? 'selected' : ''}`}
                            onClick={() => selectRejectionReason('selfie', template)}
                          >
                            {template}
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Or write a custom reason..."
                        value={rejectionReasons.selfie}
                        onChange={(e) => setRejectionReasons({
                          ...rejectionReasons,
                          selfie: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Warning for rejections */}
              {Object.values(verificationDecisions).some(d => d === 'rejected') && (
                <div className="rejection-warning">
                  <FiAlertCircle />
                  <div>
                    <strong>Note:</strong>
                    {Object.values(verificationDecisions).filter(d => d === 'rejected').length === 3 ? (
                      <p>All documents rejected. User must restart the entire onboarding process.</p>
                    ) : (
                      <p>User will be able to retake only the rejected documents without restarting the entire onboarding.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="submit-actions">
                <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSubmitVerification}
                  disabled={!verificationDecisions.identity || !verificationDecisions.address || !verificationDecisions.selfie}
                >
                  Submit Verification
                </button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <FiUser className="placeholder-icon" />
              <h3>Select a user to review</h3>
              <p>Choose a user from the list to review their documents</p>
            </div>
          )}
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && currentImage && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{currentImage.title}</h3>
              <button onClick={() => setShowImageModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <img src={currentImage.url} alt={currentImage.title} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verifications;
