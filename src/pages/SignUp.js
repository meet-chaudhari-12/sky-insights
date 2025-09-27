import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { signup } from '../api'; // Import the signup function from api.js
import './Auth.css';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // NEW: State for on-page errors
  const navigate = useNavigate(); // NEW: Initialize navigate

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); // NEW: Clear previous errors

    if (!name || !email || !password) {
      setError('Please fill in all fields'); // NEW: Set error on page
      return;
    }

    try {
      // Use the centralized API function
      const data = await signup({ name, email, password });

      if (data.user) {
        // We don't get a token on signup, just user info.
        // On successful signup, it's best to redirect to login.
        alert('Signup successful! Please log in.'); // Keep this alert for success feedback
        navigate('/login');
      } else {
        // Set the error message from the backend
        setError(data.msg || 'Signup failed!');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="weather-app">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="app-title">
            <span className="weather-icon">📝</span>
            Join Sky Insights
          </h1>
          <p className="app-subtitle">Create your account to save preferences</p>
        </div>
      </div>

      <div className="weather-content">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Fill in your details to get started</p>
          </div>
          
          <form onSubmit={handleSignup} className="auth-form">
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                required
              />
            </div>
            
            <div className="input-group">
              <span className="input-icon">📧</span>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
            </div>
            
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
              />
            </div>

            {/* NEW: Display error message here */}
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="auth-button">
              <span className="button-text">Create Account</span>
              <span className="button-icon">→</span>
            </button>
          </form>
          
          <div className="auth-footer">
            <p className="auth-link-text">Already have an account?</p>
            <a href="/login" className="auth-link">Sign In</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;