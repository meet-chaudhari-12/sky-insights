import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for user data in local storage to determine login status
  const user = JSON.parse(localStorage.getItem('user'));

  // Define the logout handler
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🌤️</span>
          <span className="logo-text">Sky Insights</span>
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>

          {/* --- NEW: Conditional Links --- */}
          {user ? (
            // Links to show if the user IS logged in
            <>
            <Link 
        to="/dashboard" 
        className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
      >
        <span className="nav-icon">📊</span>
        <span className="nav-text">Dashboard</span>
      </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-text">Profile</span>
              </Link>
              <button onClick={handleLogout} className="nav-link">
                <span className="nav-icon">🚪</span>
                <span className="nav-text">Logout</span>
              </button>
            </>
          ) : (
            // Links to show if the user IS NOT logged in
            <>
              <Link 
                to="/login" 
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                <span className="nav-icon">🔑</span>
                <span className="nav-text">Login</span>
              </Link>
              <Link 
                to="/signup" 
                className={`nav-link ${location.pathname === '/signup' ? 'active' : ''}`}
              >
                <span className="nav-icon">📝</span>
                <span className="nav-text">Sign Up</span>
              </Link>
            </>
          )}
          {/* --- End of Conditional Links --- */}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;