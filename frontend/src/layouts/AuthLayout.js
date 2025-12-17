import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-brand">
          <img src={`${process.env.PUBLIC_URL}/logo.svg`} alt="Udhar Check Logo" className="brand-logo" />
          <h1 className="brand-name">उधार CHECK</h1>
          <p className="brand-tagline">Trusted Peer-to-Peer Lending</p>
        </div>
        <div className="auth-content">
          <Outlet />
        </div>
      </div>
      <div className="auth-banner">
        <div className="banner-content">
          <h2>Connect. Lend. Borrow.</h2>
          <p>A trusted platform for peer-to-peer lending with verified users, smart reputation scoring, and secure transactions.</p>
          <div className="banner-features">
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>Identity Verified</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Trust Score System</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔔</span>
              <span>Smart Reminders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
