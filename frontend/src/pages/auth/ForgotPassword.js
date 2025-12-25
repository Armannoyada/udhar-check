import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // Password strength validation
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        newErrors.newPassword = passwordError;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: '', width: '0%', label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 'weak', width: '33%', label: 'Weak' };
    if (strength <= 4) return { strength: 'medium', width: '66%', label: 'Medium' };
    return { strength: 'strong', width: '100%', label: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword({
        email: formData.email,
        newPassword: formData.newPassword
      });

      toast.success(response.data.message || 'Password updated successfully!');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      toast.error(errorMessage);
      
      // Set specific error based on response
      if (error.response?.data?.field) {
        setErrors({
          [error.response.data.field]: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-subtitle">Enter your email and new password</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className={`form-input ${errors.email ? 'input-error' : ''}`}
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            name="newPassword"
            className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleChange}
            disabled={loading}
          />
          {formData.newPassword && (
            <div className="password-strength">
              <div 
                className={`password-strength-fill ${passwordStrength.strength}`}
                style={{ width: passwordStrength.width }}
              ></div>
            </div>
          )}
          {formData.newPassword && passwordStrength.label && (
            <div className={`password-strength-label ${passwordStrength.strength}`}>
              {passwordStrength.label}
            </div>
          )}
          {errors.newPassword && <div className="form-error">{errors.newPassword}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%' }} 
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : 'Reset Password'}
          </button>
        </div>
      </form>

      <p className="auth-footer">
        Remember your password? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
