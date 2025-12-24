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
    min_transaction_amount: 500,
    max_transaction_amount: 100000,
    min_loan_duration_days: 7,
    max_loan_duration_days: 365,
    default_interest_rate: 10,
    
    // Score Settings
    trust_score_default: 50,
    repayment_score_default: 50,
    auto_block_report_threshold: 5,
    
    // Verification Settings
    require_id_verification: true,
    require_face_verification: true,
    
    // Notification Settings
    enable_email_notifications: true,
    enable_sms_notifications: true,
    enable_whatsapp_notifications: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      if (response.data.data) {
        // Handle grouped settings format from backend
        const groupedSettings = response.data.data;
        const flatSettings = {};
        
        // Flatten the grouped settings
        Object.values(groupedSettings).forEach(categorySettings => {
          if (Array.isArray(categorySettings)) {
            categorySettings.forEach(setting => {
              // Convert string values to appropriate types
              let value = setting.value;
              if (value === 'true') value = true;
              else if (value === 'false') value = false;
              else if (!isNaN(value) && value !== '') value = parseFloat(value);
              
              flatSettings[setting.key] = value;
            });
          }
        });
        
        setSettings(prev => ({ ...prev, ...flatSettings }));
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
        min_transaction_amount: 500,
        max_transaction_amount: 100000,
        min_loan_duration_days: 7,
        max_loan_duration_days: 365,
        default_interest_rate: 10,
        trust_score_default: 50,
        repayment_score_default: 50,
        auto_block_report_threshold: 5,
        require_id_verification: true,
        require_face_verification: true,
        enable_email_notifications: true,
        enable_sms_notifications: true,
        enable_whatsapp_notifications: true
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
                  name="min_transaction_amount"
                  className="form-input"
                  value={settings.min_transaction_amount}
                  onChange={handleInputChange}
                  min="100"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Loan Amount (₹)</label>
                <input
                  type="number"
                  name="max_transaction_amount"
                  className="form-input"
                  value={settings.max_transaction_amount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Duration (Days)</label>
                <input
                  type="number"
                  name="min_loan_duration_days"
                  className="form-input"
                  value={settings.min_loan_duration_days}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Duration (Days)</label>
                <input
                  type="number"
                  name="max_loan_duration_days"
                  className="form-input"
                  value={settings.max_loan_duration_days}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Interest Rate (%)</label>
                <input
                  type="number"
                  name="default_interest_rate"
                  className="form-input"
                  value={settings.default_interest_rate}
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
                  name="trust_score_default"
                  className="form-input"
                  value={settings.trust_score_default}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
                <span className="form-hint">New users start with this score</span>
              </div>
              <div className="form-group">
                <label className="form-label">Default Repayment Score</label>
                <input
                  type="number"
                  name="repayment_score_default"
                  className="form-input"
                  value={settings.repayment_score_default}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                />
                <span className="form-hint">Initial repayment score for users</span>
              </div>
              <div className="form-group">
                <label className="form-label">Auto Block Report Threshold</label>
                <input
                  type="number"
                  name="auto_block_report_threshold"
                  className="form-input"
                  value={settings.auto_block_report_threshold}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                />
                <span className="form-hint">Reports needed to auto-block user</span>
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
                    name="require_id_verification"
                    checked={settings.require_id_verification}
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
                    name="require_face_verification"
                    checked={settings.require_face_verification}
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
                    name="enable_email_notifications"
                    checked={settings.enable_email_notifications}
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
                    name="enable_sms_notifications"
                    checked={settings.enable_sms_notifications}
                    onChange={handleInputChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-item">
                <div className="toggle-info">
                  <h4>WhatsApp Notifications</h4>
                  <p>Send WhatsApp notifications for updates</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="enable_whatsapp_notifications"
                    checked={settings.enable_whatsapp_notifications}
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
  );
};

export default Settings;
