import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCamera, FiUpload, FiCheck, FiArrowRight, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const webcamRef = useRef(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isResubmission, setIsResubmission] = useState(false);
  const [rejectedDocs, setRejectedDocs] = useState([]);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    governmentIdType: 'aadhar',
    governmentIdNumber: '',
    lendingLimit: '',
    termsAccepted: false
  });
  const [files, setFiles] = useState({
    profilePhoto: null,
    selfiePhoto: null,
    governmentId: null
  });
  const [previews, setPreviews] = useState({
    profilePhoto: null,
    selfiePhoto: null,
    governmentId: null
  });

  // Check if this is a resubmission (user has rejected documents)
  useEffect(() => {
    if (user && user.verificationStatus === 'rejected' && user.rejectedDocuments && user.rejectedDocuments.length > 0) {
      setIsResubmission(true);
      setRejectedDocs(user.rejectedDocuments);
      
      // Pre-fill existing data
      setFormData({
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        governmentIdType: user.governmentIdType || 'aadhar',
        governmentIdNumber: user.governmentIdNumber || '',
        lendingLimit: user.lendingLimit || '',
        termsAccepted: false
      });

      // Set existing previews for approved documents
      const needsIdentity = user.rejectedDocuments.some(r => r.type === 'identity');
      const needsSelfie = user.rejectedDocuments.some(r => r.type === 'selfie');
      
      if (!needsIdentity && user.governmentId) {
        setPreviews(prev => ({ ...prev, governmentId: `http://localhost:5000${user.governmentId}` }));
      }
      if (!needsSelfie && user.selfiePhoto) {
        setPreviews(prev => ({ ...prev, selfiePhoto: `http://localhost:5000${user.selfiePhoto}` }));
      }
      if (user.profilePhoto) {
        setPreviews(prev => ({ ...prev, profilePhoto: `http://localhost:5000${user.profilePhoto}` }));
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Validate government ID number input based on type
    if (name === 'governmentIdNumber') {
      let validatedValue = value;
      
      if (formData.governmentIdType === 'aadhar') {
        // Only allow digits for Aadhar
        validatedValue = value.replace(/\D/g, '').slice(0, 12);
      } else if (formData.governmentIdType === 'pan') {
        // PAN: 5 letters, 4 digits, 1 letter (uppercase)
        validatedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      } else if (formData.governmentIdType === 'voter_id') {
        // Voter ID: 3 letters + 7 digits (uppercase)
        validatedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      }
      
      setFormData({ 
        ...formData, 
        [name]: validatedValue
      });
    } else if (name === 'pincode') {
      // Only allow digits for pincode
      const validatedValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData({ 
        ...formData, 
        [name]: validatedValue
      });
    } else {
      setFormData({ 
        ...formData, 
        [name]: type === 'checkbox' ? checked : value 
      });
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [fieldName]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews({ ...previews, [fieldName]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // Convert base64 to blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
          setFiles({ ...files, selfiePhoto: file });
          setPreviews({ ...previews, selfiePhoto: imageSrc });
          setShowCamera(false);
        });
    }
  }, [webcamRef, files, previews]);

  const validateStep = () => {
    switch (step) {
      case 1:
        // Skip address validation if address is not rejected
        if (isResubmission && !rejectedDocs.some(doc => doc.type === 'address')) {
          return true;
        }
        
        if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
          toast.error('Please fill in all address fields');
          return false;
        }
        // Validate pincode format (6 digits)
        if (!/^\d{6}$/.test(formData.pincode)) {
          toast.error('Please enter a valid 6-digit pincode');
          return false;
        }
        return true;
      case 2:
        // Skip identity validation if identity is not rejected
        if (isResubmission && !rejectedDocs.some(doc => doc.type === 'identity')) {
          return true;
        }
        
        if (!formData.governmentIdType || !formData.governmentIdNumber || !files.governmentId) {
          toast.error('Please provide government ID details and upload document');
          return false;
        }
        
        // Validate Aadhar number (12 digits)
        if (formData.governmentIdType === 'aadhar') {
          if (!/^\d{12}$/.test(formData.governmentIdNumber.replace(/\s/g, ''))) {
            toast.error('Please enter a valid 12-digit Aadhar number');
            return false;
          }
        }
        
        // Validate PAN card format (5 letters, 4 digits, 1 letter)
        if (formData.governmentIdType === 'pan') {
          const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
          if (!panRegex.test(formData.governmentIdNumber)) {
            toast.error('Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)');
            return false;
          }
        }
        
        // Validate Voter ID format (3 letters + 7 digits)
        if (formData.governmentIdType === 'voter_id') {
          const voterIdRegex = /^[A-Z]{3}[0-9]{7}$/;
          if (!voterIdRegex.test(formData.governmentIdNumber)) {
            toast.error('Invalid Voter ID format. Must be 3 letters followed by 7 digits (e.g., ABC1234567)');
            return false;
          }
        }
        
        // Validate file type (only images and PDFs)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(files.governmentId.type)) {
          toast.error('Please upload a valid document (JPG, PNG, or PDF only)');
          return false;
        }
        
        // Validate file size (max 5MB)
        if (files.governmentId.size > 5 * 1024 * 1024) {
          toast.error('Document file size must be less than 5MB');
          return false;
        }
        
        return true;
      case 3:
        // Skip selfie validation if selfie is not rejected
        if (isResubmission && !rejectedDocs.some(doc => doc.type === 'selfie')) {
          return true;
        }
        
        if (!files.selfiePhoto) {
          toast.error('Please take a selfie for verification');
          return false;
        }
        
        // Validate selfie file type
        const selfieAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!selfieAllowedTypes.includes(files.selfiePhoto.type)) {
          toast.error('Selfie must be a JPG or PNG image');
          return false;
        }
        
        return true;
      case 4:
        if (user.role === 'lender') {
          if (!formData.lendingLimit || parseFloat(formData.lendingLimit) < 1000) {
            toast.error('Please enter a valid lending limit (min ₹1000)');
            return false;
          }
          if (!formData.termsAccepted) {
            toast.error('Please accept the terms and conditions');
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      if (files.profilePhoto) submitData.append('profilePhoto', files.profilePhoto);
      if (files.selfiePhoto) submitData.append('selfiePhoto', files.selfiePhoto);
      if (files.governmentId) submitData.append('governmentId', files.governmentId);

      await authAPI.completeOnboarding(submitData);
      await refreshUser();
      
      toast.success('Onboarding completed successfully!');
      
      if (user.role === 'lender') {
        navigate('/lender');
      } else {
        navigate('/borrower');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-step">
            <h2>Address Information</h2>
            <p className="step-description">Please provide your current address</p>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <textarea
                name="address"
                className="form-input form-textarea"
                placeholder="Enter your full address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="pincode"
                className="form-input"
                placeholder="6-digit pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                pattern="\d{6}"
              />
              <small style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                Enter 6-digit pincode
              </small>
            </div>
          </div>
        );

      case 2:
        const identityRejected = isResubmission && rejectedDocs.some(doc => doc.type === 'identity');
        
        return (
          <div className="onboarding-step">
            <h2>Identity Verification</h2>
            <p className="step-description">
              {identityRejected ? 'Update your government ID document' : 'Upload your government ID for verification'}
            </p>

            {!identityRejected && isResubmission && (
              <div className="approved-badge">
                <FiCheck /> This document was already approved. No changes needed.
              </div>
            )}

            <div className="form-group">
              <label className="form-label">ID Type</label>
              <select
                name="governmentIdType"
                className="form-input form-select"
                value={formData.governmentIdType}
                onChange={handleChange}
              >
                <option value="aadhar">Aadhar Card</option>
                <option value="pan">PAN Card</option>
                <option value="voter_id">Voter ID</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">ID Number</label>
              <input
                type="text"
                name="governmentIdNumber"
                className="form-input"
                placeholder={
                  formData.governmentIdType === 'aadhar' ? '12-digit Aadhar number' :
                  formData.governmentIdType === 'pan' ? 'PAN (e.g., ABCDE1234F)' :
                  formData.governmentIdType === 'voter_id' ? 'Voter ID (e.g., ABC1234567)' :
                  'Enter your ID number'
                }
                value={formData.governmentIdNumber}
                onChange={handleChange}
                maxLength={
                  formData.governmentIdType === 'aadhar' ? 12 :
                  formData.governmentIdType === 'pan' ? 10 :
                  formData.governmentIdType === 'voter_id' ? 10 :
                  20
                }
              />
              <small style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                {formData.governmentIdType === 'aadhar' && 'Enter 12-digit Aadhar number (numbers only)'}
                {formData.governmentIdType === 'pan' && 'Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)'}
                {formData.governmentIdType === 'voter_id' && 'Format: 3 letters followed by 7 digits (e.g., ABC1234567)'}
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Upload ID Document</label>
              <small style={{ color: 'var(--gray-500)', display: 'block', marginBottom: '0.5rem' }}>
                Accepted formats: JPG, PNG, PDF (Max 5MB)
              </small>
              <div className="file-upload">
                {previews.governmentId ? (
                  <div className="file-preview">
                    {files.governmentId.type === 'application/pdf' ? (
                      <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '3rem' }}>📄</span>
                        <p>{files.governmentId.name}</p>
                      </div>
                    ) : (
                      <img src={previews.governmentId} alt="ID Preview" />
                    )}
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setFiles({ ...files, governmentId: null });
                        setPreviews({ ...previews, governmentId: null });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="file-upload-label">
                    <FiUpload size={24} />
                    <span>Click to upload document</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, 'governmentId')}
                      hidden
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        const selfieRejected = isResubmission && rejectedDocs.some(doc => doc.type === 'selfie');
        
        return (
          <div className="onboarding-step">
            <h2>Take a Selfie</h2>
            <p className="step-description">
              {selfieRejected ? 'Retake your selfie for verification' : 'We need a selfie to verify your identity'}
            </p>

            {!selfieRejected && isResubmission && (
              <div className="approved-badge">
                <FiCheck /> This document was already approved. No changes needed.
              </div>
            )}

            <div className="selfie-container">
              {showCamera ? (
                <div className="webcam-container">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 480,
                      height: 480,
                      facingMode: 'user'
                    }}
                  />
                  <div className="webcam-controls">
                    <button type="button" className="btn btn-primary" onClick={capturePhoto}>
                      <FiCamera /> Capture
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCamera(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : previews.selfiePhoto ? (
                <div className="selfie-preview">
                  <img src={previews.selfiePhoto} alt="Selfie" />
                  <div className="selfie-actions">
                    <span className="badge badge-success"><FiCheck /> Captured</span>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowCamera(true)}
                    >
                      Retake
                    </button>
                  </div>
                </div>
              ) : (
                <div className="selfie-placeholder">
                  <FiCamera size={48} />
                  <p>Position your face in the frame</p>
                  <button type="button" className="btn btn-primary" onClick={() => setShowCamera(true)}>
                    <FiCamera /> Open Camera
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        if (user.role !== 'lender') return null;
        return (
          <div className="onboarding-step">
            <h2>Lending Setup</h2>
            <p className="step-description">Set your lending preferences</p>

            <div className="form-group">
              <label className="form-label">Maximum Lending Amount (₹)</label>
              <input
                type="number"
                name="lendingLimit"
                className="form-input"
                placeholder="e.g., 50000"
                value={formData.lendingLimit}
                onChange={handleChange}
                min={1000}
              />
              <small style={{ color: 'var(--gray-500)' }}>
                This is the maximum amount you're willing to lend at any time
              </small>
            </div>

            <div className="terms-box">
              <h3>Terms and Conditions</h3>
              <div className="terms-content">
                <p>By becoming a lender on this platform, you agree to:</p>
                <ul>
                  <li>Follow all platform guidelines and policies</li>
                  <li>Only lend money you can afford to lose</li>
                  <li>Treat all borrowers with respect and dignity</li>
                  <li>Report any suspicious activity immediately</li>
                  <li>Understand that the platform does not guarantee repayment</li>
                  <li>Not engage in any illegal lending practices</li>
                </ul>
              </div>
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                />
                <span>I accept the terms and conditions</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Handle loading and authentication checks
  if (authLoading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.isOnboardingComplete && user.verificationStatus !== 'rejected') {
    navigate(user.role === 'lender' ? '/lender/dashboard' : '/borrower/dashboard');
    return null;
  }

  const totalSteps = user.role === 'lender' ? 4 : 3;

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1 className="brand-name">उधार CHECK</h1>
          <p>{isResubmission ? 'Update Your Rejected Documents' : 'Complete your profile to get started'}</p>
        </div>

        {/* Resubmission Notice */}
        {isResubmission && rejectedDocs.length > 0 && (
          <div className="resubmission-notice">
            <FiAlertCircle className="notice-icon" />
            <div className="notice-content">
              <h3>Documents Requiring Resubmission:</h3>
              <ul>
                {rejectedDocs.map((doc, index) => (
                  <li key={index}>
                    <strong>
                      {doc.type === 'identity' && 'Identity Document'}
                      {doc.type === 'address' && 'Address Verification'}
                      {doc.type === 'selfie' && 'Selfie Photo'}
                    </strong>
                    {doc.reason && `: ${doc.reason}`}
                  </li>
                ))}
              </ul>
              <p className="notice-hint">Only update the rejected documents listed above. Previously approved documents will be retained.</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="progress-steps">{[...Array(totalSteps)].map((_, i) => (
            <div key={i} className={`progress-step ${step > i ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}>
              <div className="step-number">
                {step > i + 1 ? <FiCheck /> : i + 1}
              </div>
              <span className="step-label">
                {i === 0 && 'Address'}
                {i === 1 && 'ID Verification'}
                {i === 2 && 'Selfie'}
                {i === 3 && 'Setup'}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="onboarding-content">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="onboarding-nav">
          {step > 1 && (
            <button type="button" className="btn btn-secondary" onClick={prevStep}>
              <FiArrowLeft /> Back
            </button>
          )}
          
          {step < totalSteps ? (
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next <FiArrowRight />
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-success" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
