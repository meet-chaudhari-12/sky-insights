import React from 'react';
import './MiniWeatherCard.css'; // We'll create this next

const MiniWeatherCard = ({ weatherData }) => {
  if (!weatherData) return null;

  const getWeatherEmoji = (main) => {
    switch (main.toLowerCase()) {
      case 'clouds': return '☁️';
      case 'clear': return '☀️';
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      case 'thunderstorm': return '⛈️';
      case 'drizzle': return '🌦️';
      case 'mist': case 'fog': case 'haze': return '🌫️';
      default: return '🌡️';
    }
  };

  return (
    <div className="mini-weather-card">
      <div className="mini-card-header">
        <h3 className="mini-city-name">{weatherData.name}</h3>
        <p className="mini-condition">{weatherData.weather[0].main}</p>
      </div>
      <div className="mini-card-body">
        <span className="mini-temp">{Math.round(weatherData.main.temp)}°</span>
        <span className="mini-icon">{getWeatherEmoji(weatherData.weather[0].main)}</span>
      </div>
    </div>
  );
};

export default MiniWeatherCard;