/**
 * Landing Page Component for UdharCheck
 * 
 * This is the public landing page that users see before login/registration.
 * It showcases the platform's features, how it works, and guides users to register or login.
 * 
 * Sections:
 * 1. Header/Navbar - Sticky navigation with logo and links
 * 2. Hero Section - Main headline and CTAs
 * 3. How It Works - Step-by-step process explanation
 * 4. Key Features - Feature cards
 * 5. Trust & Security - Security information
 * 6. Call to Action - Final CTA section
 * 7. Footer - Links and copyright
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaIdCard, 
  FaStar, 
  FaHandshake, 
  FaBell,
  FaShieldAlt,
  FaChartLine,
  FaLock,
  FaUserCheck,
  FaCheckCircle,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaMoneyBillWave,
  FaUsers,
  FaClipboardCheck
} from 'react-icons/fa';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="landing-page">
      {/* ============ HEADER / NAVBAR ============ */}
      <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="landing-container">
          <nav className="landing-nav">
            {/* Logo */}
            <Link to="/" className="landing-logo">
              <div className="logo-icon">U</div>
              <span className="logo-text">
                <span className="logo-hindi">उधार</span>CHECK
              </span>
            </Link>

            {/* Desktop Navigation */}
            <ul className="nav-links">
              <li>
                <button onClick={() => scrollToSection('how-it-works')}>
                  How it Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')}>
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('trust-security')}>
                  Trust & Security
                </button>
              </li>
            </ul>

            {/* Auth Buttons */}
            <div className="nav-auth">
              <Link to="/login" className="btn-nav-login">Login</Link>
              <Link to="/register" className="btn-nav-register">Register</Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </nav>

          {/* Mobile Menu */}
          <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <ul className="mobile-nav-links">
              <li>
                <button onClick={() => scrollToSection('how-it-works')}>
                  How it Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')}>
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('trust-security')}>
                  Trust & Security
                </button>
              </li>
            </ul>
            <div className="mobile-auth">
              <Link to="/login" className="btn-mobile-login">Login</Link>
              <Link to="/register" className="btn-mobile-register">Register</Link>
            </div>
          </div>
        </div>
      </header>

      {/* ============ HERO SECTION ============ */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="landing-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Trusted Peer-to-Peer Lending Made <span className="highlight">Simple</span>
              </h1>
              <p className="hero-subtitle">
                UdharCheck helps users lend and borrow money securely using identity verification, 
                smart trust scores, and transparent tracking. Join thousands of verified users today.
              </p>
              <div className="hero-ctas">
                <Link to="/register" className="btn-primary-cta">
                  Get Started <FaArrowRight />
                </Link>
                <Link to="/login" className="btn-secondary-cta">
                  Login
                </Link>
              </div>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">10K+</span>
                  <span className="stat-label">Verified Users</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">₹5Cr+</span>
                  <span className="stat-label">Loans Processed</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">98%</span>
                  <span className="stat-label">Repayment Rate</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card">
                <div className="hero-card-header">
                  <FaShieldAlt className="hero-card-icon" />
                  <span>Secure Platform</span>
                </div>
                <div className="hero-card-content">
                  <div className="trust-score-preview">
                    <div className="score-ring">
                      <span className="score-value">850</span>
                    </div>
                    <p>Trust Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS SECTION ============ */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="landing-container">
          <div className="section-header">
            <h2 className="section-title">How UdharCheck Works</h2>
            <p className="section-subtitle">
              Simple, secure, and transparent peer-to-peer lending in 5 easy steps
            </p>
          </div>

          <div className="steps-container">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <FaUserPlus />
              </div>
              <h3 className="step-title">Register</h3>
              <p className="step-description">
                Create your account as a Lender or Borrower. Quick signup with email and phone verification.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <FaIdCard />
              </div>
              <h3 className="step-title">Verify Identity</h3>
              <p className="step-description">
                Complete KYC with ID verification and face matching. Builds trust and ensures platform safety.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <FaStar />
              </div>
              <h3 className="step-title">Get Trust Score</h3>
              <p className="step-description">
                Receive your personalized trust score based on verification level and platform behavior.
              </p>
            </div>

            {/* Step 4 */}
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">
                <FaHandshake />
              </div>
              <h3 className="step-title">Lend or Borrow</h3>
              <p className="step-description">
                Lenders offer funds, borrowers request loans. Platform matches users securely and transparently.
              </p>
            </div>

            {/* Step 5 */}
            <div className="step-card">
              <div className="step-number">5</div>
              <div className="step-icon">
                <FaBell />
              </div>
              <h3 className="step-title">Track & Repay</h3>
              <p className="step-description">
                Monitor loan status, receive smart reminders, and maintain transparent repayment records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ KEY FEATURES SECTION ============ */}
      <section id="features" className="features-section">
        <div className="landing-container">
          <div className="section-header">
            <h2 className="section-title">Key Features</h2>
            <p className="section-subtitle">
              Everything you need for safe and efficient peer-to-peer lending
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon verified">
                <FaUserCheck />
              </div>
              <h3 className="feature-title">Identity Verified Users</h3>
              <p className="feature-description">
                Every user undergoes strict identity verification including government ID and face matching.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon trust">
                <FaChartLine />
              </div>
              <h3 className="feature-title">Smart Trust Scores</h3>
              <p className="feature-description">
                Dynamic trust scores based on verification, behavior, and repayment history help you make informed decisions.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon secure">
                <FaLock />
              </div>
              <h3 className="feature-title">Secure Transactions</h3>
              <p className="feature-description">
                End-to-end encrypted transactions with complete audit trails ensure your money is safe.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon reminder">
                <FaBell />
              </div>
              <h3 className="feature-title">Smart Reminders</h3>
              <p className="feature-description">
                Automated notifications keep both lenders and borrowers informed about due dates and payments.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon admin">
                <FaClipboardCheck />
              </div>
              <h3 className="feature-title">Admin Approved</h3>
              <p className="feature-description">
                Every profile is reviewed and approved by our admin team before users can transact.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon community">
                <FaUsers />
              </div>
              <h3 className="feature-title">Growing Community</h3>
              <p className="feature-description">
                Join a thriving community of verified lenders and borrowers building financial trust together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST & SECURITY SECTION ============ */}
      <section id="trust-security" className="trust-section">
        <div className="landing-container">
          <div className="trust-content">
            <div className="trust-text">
              <h2 className="section-title">Trust & Security</h2>
              <p className="trust-description">
                Your safety is our top priority. UdharCheck implements multiple layers of security 
                to ensure every transaction is safe and every user is verified.
              </p>

              <div className="trust-features">
                <div className="trust-feature">
                  <FaCheckCircle className="trust-check" />
                  <div>
                    <h4>Verified Users Only</h4>
                    <p>All users must complete KYC verification before lending or borrowing.</p>
                  </div>
                </div>

                <div className="trust-feature">
                  <FaCheckCircle className="trust-check" />
                  <div>
                    <h4>Admin Approvals</h4>
                    <p>Every profile is manually reviewed by our team for authenticity.</p>
                  </div>
                </div>

                <div className="trust-feature">
                  <FaCheckCircle className="trust-check" />
                  <div>
                    <h4>Fraud Prevention</h4>
                    <p>Advanced algorithms detect and prevent fraudulent activities.</p>
                  </div>
                </div>

                <div className="trust-feature">
                  <FaCheckCircle className="trust-check" />
                  <div>
                    <h4>Secure Data Handling</h4>
                    <p>Your personal and financial data is encrypted and protected.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="trust-visual">
              <div className="shield-container">
                <FaShieldAlt className="shield-icon" />
                <div className="shield-rings">
                  <div className="ring ring-1"></div>
                  <div className="ring ring-2"></div>
                  <div className="ring ring-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CALL TO ACTION SECTION ============ */}
      <section className="cta-section">
        <div className="landing-container">
          <div className="cta-content">
            <h2 className="cta-title">Start Lending or Borrowing with Confidence</h2>
            <p className="cta-subtitle">
              Join thousands of verified users on India's most trusted peer-to-peer lending platform.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-cta-primary">
                <FaMoneyBillWave /> Register Now
              </Link>
              <Link to="/login" className="btn-cta-secondary">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="logo-icon">U</div>
                <span className="logo-text">
                  <span className="logo-hindi">उधार</span>CHECK
                </span>
              </Link>
              <p className="footer-tagline">Trusted Peer-to-Peer Lending</p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Company</h4>
                <ul>
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#careers">Careers</a></li>
                  <li><a href="#press">Press</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4>Legal</h4>
                <ul>
                  <li><a href="#privacy">Privacy Policy</a></li>
                  <li><a href="#terms">Terms & Conditions</a></li>
                  <li><a href="#compliance">Compliance</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4>Support</h4>
                <ul>
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#contact">Contact Us</a></li>
                  <li><a href="#faq">FAQs</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">
              © 2025 UdharCheck – Trusted Peer-to-Peer Lending. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
