import React from 'react';
import './WeatherCard.css';

const WeatherCard = ({ city, temp, condition, humidity, wind }) => {
  return (
    <div className="weather-card">
      <h2>{city}</h2>
      <p className="temp">{temp}°C</p>
      <p>{condition}</p>
      <div className="details">
        <p>Humidity: {humidity}%</p>
        <p>Wind: {wind} km/h</p>
      </div>
    </div>
  );
};

export default WeatherCard;
