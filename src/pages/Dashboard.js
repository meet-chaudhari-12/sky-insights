import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { getFavorites } from '../api'; // To get the list of favorite cities
import MiniWeatherCard from '../components/MiniWeatherCard'; // The card to display data

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllFavoritesWeather = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Get the list of favorite city names
        const favorites = await getFavorites();

        if (!favorites || favorites.length === 0) {
          setError("You haven't added any favorite cities yet. Add some from the home page!");
          setLoading(false);
          return;
        }

        const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

        // 2. Fetch weather for all cities in parallel
        const promises = favorites.map(city => {
          const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
          return fetch(url).then(res => {
            if (!res.ok) {
              console.error(`Failed to fetch weather for ${city}`);
              return null; // Return null for failed requests
            }
            return res.json();
          });
        });

        const results = await Promise.all(promises);
        
        // 3. Filter out any failed requests and update state
        setWeatherData(results.filter(data => data !== null));
        
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFavoritesWeather();
  }, []); // The empty array means this runs once when the component mounts

  return (
    <div className="weather-app">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="app-title">
            <span className="weather-icon">📊</span>
            My Dashboard
          </h1>
          <p className="app-subtitle">Your favorite cities at a glance</p>
        </div>
      </div>
      <div className="weather-content">
        {loading && <p className="dashboard-placeholder">Loading dashboard...</p>}
        {error && <p className="dashboard-placeholder">{error}</p>}
        {!loading && !error && (
          <div className="dashboard-grid">
            {weatherData.map((weather) => (
              <MiniWeatherCard key={weather.id} weatherData={weather} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;