import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // NEW: State to hold error messages
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // NEW: Clear previous errors on a new attempt

    if (!email || !password) {
      setError('Please fill in all fields'); // NEW: Set error instead of alert
      return;
    }

    try {
      const data = await login({ email, password });

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        // NEW: Set error message from the backend response
        setError(data.error || 'Login failed!');
      }
    } catch (err) {
      console.error(err);
      // NEW: Set a generic error for unexpected issues
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="weather-app">
      {/* ... Hero Section remains the same ... */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="app-title">
            <span className="weather-icon">🔑</span>
            Welcome Back
          </h1>
          <p className="app-subtitle">Sign in to access your weather dashboard</p>
        </div>
      </div>


      <div className="weather-content">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Login</h2>
            <p className="auth-subtitle">Enter your credentials to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <div className="input-icon">📧</div>
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
              <div className="input-icon">🔒</div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
              />
            </div>
            
            {/* NEW: Conditionally render the error message */}
            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-button">
              <span className="button-text">Sign In</span>
              <span className="button-icon">→</span>
            </button>
          </form>
          
          <div className="auth-footer">
            <p className="auth-link-text">Don't have an account?</p>
            <a href="/signup" className="auth-link">Create Account</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;