import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FiSettings, 
  FiPercent, 
  FiClock, 
  FiShield,
  FiMail,
  FiBell,
  FiSave,
  FiRefreshCw
} from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Loan Settings
    minLoanAmount: 1000,
    maxLoanAmount: 500000,
    minLoanDuration: 7,
    maxLoanDuration: 365,
    defaultInterestRate: 10,
    maxInterestRate: 36,
    
    // Score Settings
    defaultTrustScore: 50,
    minTrustScoreForLending: 30,
    repaymentScoreImpact: 5,
    latePaymentPenalty: 10,
    
    // Verification Settings
    requireIdVerification: true,
    requireFaceVerification: true,
    autoApproveVerifiedUsers: false,
    
    // Notification Settings
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    reminderDaysBeforeDue: 3,
    
    // Platform Settings
    platformFeePercent: 1,
    maintenanceMode: false,
    allowNewRegistrations: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      if (response.data.data) {
        setSettings(prev => ({ ...prev, ...response.data.data }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      setSettings({
        minLoanAmount: 1000,
        maxLoanAmount: 500000,
        minLoanDuration: 7,
        maxLoanDuration: 365,
        defaultInterestRate: 10,
        maxInterestRate: 36,
        defaultTrustScore: 50,
        minTrustScoreForLending: 30,
        repaymentScoreImpact: 5,
        latePaymentPenalty: 10,
        requireIdVerification: true,
        requireFaceVerification: true,
        autoApproveVerifiedUsers: false,
        enableEmailNotifications: true,
        enableSmsNotifications: false,
        reminderDaysBeforeDue: 3,
        platformFeePercent: 1,
        maintenanceMode: false,
        allowNewRegistrations: true
      });
      toast.info('Settings reset to default values');
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
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">Configure platform-wide settings and parameters</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handleReset}>
            <FiRefreshCw /> Reset to Default
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner"></span> : <><FiSave /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Loan Settings */}
        <div className="card">
          <div className="card-header">
            <h3><FiPercent /> Loan Settings</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Minimum Loan Amount (₹)</label>
                <input
                  type="number"
                  name="minLoanAmount"
                  className="form-input"
                  value={settings.minLoanAmount}
                  onChange={handleInputChange}
                  min="100"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Loan Amount (₹)</label>
                <input
                  type="number"
                  name="maxLoanAmount"
                  className="form-input"
                  value={settings.maxLoanAmount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Duration (Days)</label>
                <input
                  type="number"
                  name="minLoanDuration"
                  className="form-input"
                  value={settings.minLoanDuration}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Duration (Days)</label>
                <input
                  type="number"
                  name="maxLoanDuration"
                  className="form-input"
                  value={settings.maxLoanDuration}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Interest Rate (%)</label>
                <input
                  type="number"
                  name="defaultInterestRate"
                  className="form-input"
                  value={settings.defaultInterestRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Interest Rate (%)</label>
                <input
                  type="number"
                  name="maxInterestRate"
                  className="form-input"
                  value={settings.maxInterestRate}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Score Settings */}
        <div className="card">
          <div className="card-header">
            <h3><FiShield /> Score Settings</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Default Trust Score</label>
                <input
                  type="number"
                  name="defaultTrustScore"
                  className="form-input"
                  value={settings.defaultTrustScore}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
                <span className="form-hint">New users start with this score</span>
              </div>
              <div className="form-group">
                <label className="form-label">Min Trust Score for Lending</label>
                <input
                  type="number"
                  name="minTrustScoreForLending"
                  className="form-input"
                  value={settings.minTrustScoreForLending}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
                <span className="form-hint">Borrowers below this cannot borrow</span>
              </div>
              <div className="form-group">
                <label className="form-label">Repayment Score Impact</label>
                <input
                  type="number"
                  name="repaymentScoreImpact"
                  className="form-input"
                  value={settings.repaymentScoreImpact}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                />
                <span className="form-hint">Points added/removed per repayment</span>
              </div>
              <div className="form-group">
                <label className="form-label">Late Payment Penalty</label>
                <input
                  type="number"
                  name="latePaymentPenalty"
                  className="form-input"
                  value={settings.latePaymentPenalty}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                />
                <span className="form-hint">Points deducted for late payments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Settings */}
        <div className="card">
          <div className="card-header">
            <h3><FiShield /> Verification Settings</h3>
          </div>
          <div className="card-body">
            <div className="toggle-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Require ID Verification</h4>
                  <p>Users must verify their government ID to use the platform</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="requireIdVerification"
                    checked={settings.requireIdVerification}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Require Face Verification</h4>
                  <p>Users must complete selfie verification</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="requireFaceVerification"
                    checked={settings.requireFaceVerification}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Auto-approve Verified Users</h4>
                  <p>Automatically approve users who complete all verification</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="autoApproveVerifiedUsers"
                    checked={settings.autoApproveVerifiedUsers}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="card-header">
            <h3><FiBell /> Notification Settings</h3>
          </div>
          <div className="card-body">
            <div className="toggle-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>Email Notifications</h4>
                  <p>Send email notifications for loan activities</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="enableEmailNotifications"
                    checked={settings.enableEmailNotifications}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>SMS Notifications</h4>
                  <p>Send SMS notifications for important updates</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="enableSmsNotifications"
                    checked={settings.enableSmsNotifications}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Reminder Days Before Due</label>
              <input
                type="number"
                name="reminderDaysBeforeDue"
                className="form-input"
                value={settings.reminderDaysBeforeDue}
                onChange={handleInputChange}
                min="1"
                max="30"
                style={{ maxWidth: '200px' }}
              />
              <span className="form-hint">Days before due date to send reminder</span>
            </div>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="card full-width">
          <div className="card-header">
            <h3><FiSettings /> Platform Settings</h3>
          </div>
          <div className="card-body">
            <div className="settings-row">
              <div className="form-group">
                <label className="form-label">Platform Fee (%)</label>
                <input
                  type="number"
                  name="platformFeePercent"
                  className="form-input"
                  value={settings.platformFeePercent}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  step="0.1"
                  style={{ maxWidth: '200px' }}
                />
                <span className="form-hint">Fee charged on successful loans</span>
              </div>

              <div className="toggle-group">
                <div className="toggle-item inline">
                  <div className="toggle-info">
                    <h4>Maintenance Mode</h4>
                    <p>Disable platform for users</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider danger"></span>
                  </label>
                </div>

                <div className="toggle-item inline">
                  <div className="toggle-info">
                    <h4>Allow New Registrations</h4>
                    <p>Allow new users to sign up</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      name="allowNewRegistrations"
                      checked={settings.allowNewRegistrations}
                      onChange={handleInputChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
