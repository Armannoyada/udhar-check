import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginDemo } = useAuth();
    // Demo login handler
    const handleDemoLogin = (role) => {
      loginDemo(role).then((user) => {
        toast.success('Demo login successful!');
        if (!user.isOnboardingComplete && user.role !== 'admin') {
          navigate('/onboarding');
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'lender') {
          navigate('/lender');
        } else {
          navigate('/borrower');
        }
      });
    };
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      toast.success('Login successful!');
      
      // Redirect based on role and onboarding status
      if (!user.isOnboardingComplete && user.role !== 'admin') {
        navigate('/onboarding');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'lender') {
        navigate('/lender');
      } else {
        navigate('/borrower');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-subtitle">Sign in to continue to your account</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Sign In'}
          </button>
        </div>

      </form>

      {/* Demo Login Buttons */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Demo Login</div>
        <button type="button" className="btn btn-outline" style={{ margin: '0 0.5rem' }} onClick={() => handleDemoLogin('admin')}>
          Login as Admin
        </button>
        <button type="button" className="btn btn-outline" style={{ margin: '0 0.5rem' }} onClick={() => handleDemoLogin('lender')}>
          Login as Lender
        </button>
        <button type="button" className="btn btn-outline" style={{ margin: '0 0.5rem' }} onClick={() => handleDemoLogin('borrower')}>
          Login as Borrower
        </button>
      </div>

      <p className="auth-footer">
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
