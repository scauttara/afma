import React, { useState } from 'react';
import logo from '../../assets/logo.png';
import './LandingPage.scss'; // We will create this css next

const LandingPage = ({ onLoginClick }) => {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="brand">
          <img src={logo} alt="Logo" />
          <div className="brand-details">
            <span>AL-FALAH MODEL ACADEMY<sup><small><small>EIIN: 134457</small></small></sup></span>
          <span className='desc-concern'><em>A concern of <strong>Shahid Cadet Academy, Uttara</strong></em></span>
          </div>
        </div>
        <button onClick={onLoginClick} className="login-btn">Admin Login</button>
      </nav>

      <header className="hero-section">
        <h1>Welcome to Al-Falah Model Academy</h1>
        <p>A concern of Shahid Cadet Academy, Uttara</p>
        <div className="hero-actions">
            <button className="primary-btn">View Notices</button>
            <button className="secondary-btn">Contact Us</button>
        </div>
      </header>

      <section className="features">
        <div className="card"><h3>Academic Results</h3><p>Fast and accurate result processing system.</p></div>
        <div className="card"><h3>Student Info</h3><p>Digital database of all our students.</p></div>
        <div className="card"><h3>Notices</h3><p>Stay updated with latest school announcements.</p></div>
      </section>

      <footer className="landing-footer">
        <p>© 2025 Al-Falah Model Academy. All rights reserved.</p>
        <p>Dhaka, Bangladesh</p>
      </footer>
    </div>
  );
};

export default LandingPage;