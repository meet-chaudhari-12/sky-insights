import React, { useState, useEffect } from "react";
import "./Profile.css"; 
import { useNavigate } from "react-router-dom";
import { getUserDetails, setHomeLocation, removeHistory } from "../api";
import { removeHistoryItem } from "../utils/storage";

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const data = await getUserDetails();
      
      // THE KEY FIX: Check for a property on the user object itself (like 'email')
      // instead of checking for 'data.user'.
      if (data && data.email) { 
        setUserDetails(data);
      } else {
        // If the token is invalid or the API fails, log the user out.
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUserDetails();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSetHome = async (city) => {
    const updatedUser = await setHomeLocation(city);
    if (updatedUser) {
      setUserDetails(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser)); 
    } else {
      alert("Failed to set home location. Please try again.");
    }
  };

  const handleRemoveHistory = async (city) => {
    const updatedHistory = await removeHistory(city);
    if (Array.isArray(updatedHistory)) {
      removeHistoryItem(city);
      setUserDetails(prevDetails => ({ ...prevDetails, history: updatedHistory }));
    } else {
      alert("Failed to remove city from history. Please try again.");
    }
  };

  return (
    <div className="weather-app">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="app-title">
            <span className="weather-icon">👤</span>
            User Profile
          </h1>
          <p className="app-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div className="weather-content">
      {userDetails ? (
        <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{userDetails.name}</h2>
                <p className="profile-email">{userDetails.email}</p>
              </div>
            </div>
            
            <div className="profile-details">
              <div className="detail-section">
                <h3 className="section-title">⭐ Favorite Cities</h3>
                {Array.isArray(userDetails.favorites) && userDetails.favorites.length > 0 ? (
                  <div className="detail-grid">
                    {userDetails.favorites.map((city) => (
                      <div className="detail-item favorite-item" key={city}>
                        <span className="detail-icon">🏙️</span>
                        <div className="detail-content">
                          <span className="detail-value">{city}</span>
                        </div>
                        {userDetails.homeLocation === city ? (
                          <button className="home-btn active" disabled>🏠 Home</button>
                        ) : (
                          <button className="home-btn" onClick={() => handleSetHome(city)}>Set as Home</button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>You haven't added any favorite cities yet.</p>
                )}
              </div>

              <div className="detail-section">
                <h3 className="section-title">🕔 Recent Searches</h3>
                {Array.isArray(userDetails.history) && userDetails.history.length > 0 ? (
                  <div className="detail-grid">
                    {userDetails.history.map((city) => (
                      <div className="detail-item history-item" key={city}>
                        <span className="detail-icon">📍</span>
                        <div className="detail-content">
                          <span className="detail-value">{city}</span>
                        </div>
                        <button className="remove-history-btn" onClick={() => handleRemoveHistory(city)}>×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Your recent searches will appear here.</p>
                )}
              </div>
            </div>
            
            <div className="profile-actions">
              <button onClick={handleLogout} className="logout-button">
                <span className="button-icon">🚪</span>
                <span className="button-text">Sign Out</span>
              </button>
            </div>
        </div>
      ) : (
          <div className="profile-card">
            <p>Loading profile...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;