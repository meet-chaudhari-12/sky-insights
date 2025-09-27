import { useEffect, useMemo, useState, useRef } from 'react';
import '../App.css';
import './Home.css';
import React from 'react';
import HistoricalWeatherModal from '../components/HistoricalWeatherModal';
import { getHistory as getLocalHistory, pushHistory as pushLocalHistory } from '../utils/storage';
import { getFavorites, addFavorite, removeFavorite, getHistory as getApiHistory, addHistory as addApiHistory } from '../api';

// Helper function to format time
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Component specifically for the Sunrise/Sunset graph
const SunriseSunsetGraph = ({ sunrise, sunset }) => {
  const [sunPosition, setSunPosition] = useState(0);

  useEffect(() => {
    const calculateSunPosition = () => {
      const now = new Date().getTime() / 1000;
      if (!sunrise || !sunset || now < sunrise) {
        setSunPosition(0);
      } else if (now > sunset) {
        setSunPosition(100);
      } else {
        const totalDaylight = sunset - sunrise;
        const timeSinceSunrise = now - sunrise;
        const percentage = (timeSinceSunrise / totalDaylight) * 100;
        setSunPosition(percentage);
      }
    };
    calculateSunPosition();
    const interval = setInterval(calculateSunPosition, 60000);
    return () => clearInterval(interval);
  }, [sunrise, sunset]);

  const getSunYPosition = () => {
    const radians = (sunPosition / 100) * Math.PI;
    return Math.sin(radians) * 100;
  };

  return (
    <div className="sunrise-sunset-card">
      <h3 className="sunrise-sunset-title">Sunrise & Sunset</h3>
      <div className="graph-path">
        <div 
          className="sun-icon" 
          style={{ 
            left: `${sunPosition}%`,
            bottom: `${getSunYPosition()}%`
          }}
        >
          ☀️
        </div>
      </div>
      <div className="time-labels">
        <span>🌅 {formatTime(sunrise)}</span>
        <span>🌇 {formatTime(sunset)}</span>
      </div>
    </div>
  );
};


function Home() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [units, setUnits] = useState('metric');
  const [selectedDate, setSelectedDate] = useState('');
  const [historicalWeather, setHistoricalWeather] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const searchContainerRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isLoggedIn) {
      setHistory(getLocalHistory());
    } else {
      const loadUserData = async () => {
        const [userFavorites, userHistory] = await Promise.all([
          getFavorites(),
          getApiHistory() 
        ]);

        if (Array.isArray(userFavorites)) setFavorites(userFavorites);
        if (Array.isArray(userHistory)) setHistory(userHistory);
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.homeLocation) {
          fetchCoordsByCity(user.homeLocation);
        }
      };
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    if (coords) {
      fetchWeatherByCoords(coords.lat, coords.lon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);

  useEffect(() => {
    if (city.length < 3) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=5&appid=${apiKey}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const uniqueSuggestions = Array.from(new Map(data.map(item => [`${item.name},${item.country}`, item])).values());
        setSuggestions(uniqueSuggestions || []);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    };
    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [city]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    setSuggestions([]);
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    const aqiURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
      const [weatherRes, forecastRes, aqiRes] = await Promise.all([
        fetch(weatherURL),
        fetch(forecastURL),
        fetch(aqiURL)
      ]);
      if (!weatherRes.ok || !forecastRes.ok) throw new Error('Failed to fetch weather data');
      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      const aqiData = await aqiRes.json();
      const combinedWeatherData = { ...weatherData, aqi: aqiData.list[0].main.aqi };
      setWeather(combinedWeatherData);
      setForecast(forecastData.list);
      setHourlyForecast(forecastData.list.slice(0, 24));
      setCity(weatherData.name);
      setCoords({ lat, lon });
      
      if (isLoggedIn) {
        const updatedHistory = await addApiHistory(weatherData.name);
        if(Array.isArray(updatedHistory)) setHistory(updatedHistory);
      } else {
        setHistory(pushLocalHistory(weatherData.name));
      }

    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCoordsByCity = async (cityName) => {
    if (!cityName) return;
    setLoading(true);
    setError('');
    setSuggestions([]);
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        fetchWeatherByCoords(data[0].lat, data[0].lon);
      } else {
        throw new Error('City not found');
      }
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setLoading(false);
    }
  };

  const handleSearch = () => { fetchCoordsByCity(city); };
  
  const handleChipClick = (cityName) => {
    setCity(cityName);
    fetchCoordsByCity(cityName);
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeatherByCoords(position.coords.latitude, position.coords.longitude),
        (err) => setError('Geolocation failed. Please enable location services.')
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    setSuggestions([]);
    fetchWeatherByCoords(suggestion.lat, suggestion.lon);
  };
  
  const getAqiRating = (aqi) => {
    switch (aqi) {
      case 1: return { text: 'Good', className: 'aqi-good' };
      case 2: return { text: 'Fair', className: 'aqi-good' };
      case 3: return { text: 'Moderate', className: 'aqi-moderate' };
      case 4: return { text: 'Poor', className: 'aqi-unhealthy' };
      case 5: return { text: 'Very Poor', className: 'aqi-unhealthy' };
      default: return { text: 'N/A', className: '' };
    }
  };

  const fetchHistoricalWeather = async () => {
    // Safety check to prevent crash if coords are not ready
    if (!selectedDate || !coords) return;
    
    setHistoricalWeather(null); 
    setHistoricalLoading(true);
    setIsModalOpen(true); // Open the modal immediately

    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
    const dateTimestamp = Math.floor(new Date(selectedDate).getTime() / 1000);
    const historicalUrl = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${coords.lat}&lon=${coords.lon}&dt=${dateTimestamp}&appid=${apiKey}&units=${units}`;
    
    try {
      const res = await fetch(historicalUrl);
      const result = await res.json();
      
      const hourlyData = result.data;
      if (Array.isArray(hourlyData) && hourlyData.length > 0) {
        // Correctly calculate averages from the hourly data
        const totalTemp = hourlyData.reduce((sum, hour) => sum + hour.temp, 0);
        const avgTemp = totalTemp / hourlyData.length;
        const totalHumidity = hourlyData.reduce((sum, hour) => sum + hour.humidity, 0);
        const avgHumidity = totalHumidity / hourlyData.length;
        const totalWind = hourlyData.reduce((sum, hour) => sum + hour.wind_speed, 0);
        const avgWind = totalWind / hourlyData.length;
        const conditions = hourlyData.map(hour => hour.weather[0].main);
        const modeCondition = conditions.sort((a,b) =>
              conditions.filter(v => v===a).length
            - conditions.filter(v => v===b).length
        ).pop();

        const dailySummary = {
            temp: avgTemp,
            humidity: avgHumidity,
            wind_speed: avgWind,
            weather: [{ main: modeCondition }],
        };
        // Set the calculated summary to be passed to the modal
        setHistoricalWeather(dailySummary);
      } else {
        setHistoricalWeather(null);
      }
    } catch (err) {
      console.error("Failed to fetch historical data", err);
      setHistoricalWeather(null);
    } finally {
      setHistoricalLoading(false);
    }
  };

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

  const tempUnitLetter = units === 'metric' ? 'C' : 'F';
  const windUnit = units === 'metric' ? 'm/s' : 'mph';

  const handleToggleFavorite = async () => {
    if (!weather || !isLoggedIn) return alert("Please log in to save favorites!");
    const cityName = weather.name;
    const isFavorite = favorites.includes(cityName);
    try {
      const updatedFavorites = isFavorite ? await removeFavorite(cityName) : await addFavorite(cityName);
      if (Array.isArray(updatedFavorites)) {
        setFavorites(updatedFavorites);
      }
    } catch (err) {
      console.error("Failed to update favorites", err);
      alert("Could not update favorites. Please try again.");
    }
  };

  const isCurrentFavorite = useMemo(() => {
    if (!weather || !Array.isArray(favorites)) return false;
    return favorites.includes(weather.name);
  }, [favorites, weather]);

  return (
    <div className="weather-app">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="app-title"><span className="weather-icon">🌤️</span> Sky Insights</h1>
          <p className="app-subtitle">Discover weather conditions around the world</p>
          
          <div className="search-container" ref={searchContainerRef}>
            <div className="search-box">
              <button onClick={handleGeolocation} className="geo-btn" title="Get weather for your location">📍</button>
              <input type="text" placeholder="Search for a city..." value={city} onChange={(e) => setCity(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} className="search-input" />
              <button onClick={handleSearch} className="search-btn" disabled={loading || !city}>{loading ? <div className="btn-spinner"></div> : '🔍'}</button>
            </div>

            {suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((item, index) => (
                  <div key={`${item.lat}-${item.lon}-${index}`} className="suggestion-item" onClick={() => handleSuggestionClick(item)}>
                    {item.name}, {item.state && `${item.state}, `}{item.country}
                  </div>
                ))}
              </div>
            )}
            
            {history.length > 0 && (
              <div className="quick-lists">
                <span className="quick-lists-label">Recent:</span>
                <div className="chips">
                  {history.slice(0, 5).map((c) => (
                    <button key={c} className="chip" onClick={() => handleChipClick(c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* MOVED the historical picker back here */}
            {/* Historical weather trigger */}
<div className="toolbar-row">
  <div className="units-toggle" role="group" aria-label="Units">
    <button
      className={`unit-btn ${units === 'metric' ? 'active' : ''}`}
      onClick={() => setUnits('metric')}
    >
      °C
    </button>
    <button
      className={`unit-btn ${units === 'imperial' ? 'active' : ''}`}
      onClick={() => setUnits('imperial')}
    >
      °F
    </button>
  </div>
  <button
    className="history-btn"
    onClick={() => setIsModalOpen(true)} // just opens modal now
    disabled={!weather}
  >
    📜 View History
  </button>
</div>

          </div>
        </div>
      </div>
      
      <div className="weather-content">
        {loading && ( <div className="loading-container"><div className="weather-spinner"></div><p className="loading-text">Fetching weather data...</p></div> )}
        {!loading && error && ( <div className="error-container"><div className="error-icon">⚠️</div><p className="error-text">{error}</p></div> )}
        
        {!loading && weather && (
          <>
            <div className="current-weather">
              <div className="main-weather-card">
                <div className="weather-header">
                  <div className="location">
                    <h2 className="city-name">{weather.name}</h2>
                    <p className="country">{weather.sys.country}</p>
                  </div>
                  <div className="weather-icon-large">{getWeatherEmoji(weather.weather[0].main)}</div>
                </div>
                
                <div className="temperature-section">
                  <span className="temp-main">{Math.round(weather.main.temp)}°</span>
                  <span className="temp-unit">{tempUnitLetter}</span>
                </div>
                
                <div className="weather-description">
                  <p className="condition">{weather.weather[0].description}</p>
                  <p className="feels-like">Feels like {Math.round(weather.main.feels_like)}°{tempUnitLetter}</p>
                </div>
                
                <div className="weather-details">
                  <div className="detail-item"><span className="detail-icon">💨</span><div className="detail-info"><span className="detail-value">{weather.wind.speed} {windUnit}</span><span className="detail-label">Wind</span></div></div>
                  <div className="detail-item"><span className="detail-icon">💧</span><div className="detail-info"><span className="detail-value">{weather.main.humidity}%</span><span className="detail-label">Humidity</span></div></div>
                  <div className="detail-item"><span className="detail-icon">🌡️</span> <div className="detail-info"> <span className="detail-value">{weather.main.pressure} hPa</span> <span className="detail-label">Pressure</span> </div> </div>
                  <div className="detail-item"><span className="detail-icon">👁️</span> <div className="detail-info"> <span className="detail-value">{weather.visibility / 1000} km</span> <span className="detail-label">Visibility</span> </div> </div>
                  <div className="detail-item"><span className="detail-icon">🌬️</span><div className="detail-info"><span className="detail-value">{weather.aqi}<span className={`rating-badge ${getAqiRating(weather.aqi).className}`}>{getAqiRating(weather.aqi).text}</span></span><span className="detail-label">Air Quality</span></div></div>
                </div>

                {isLoggedIn && (<div className="card-actions"><button className={`fav-btn ${isCurrentFavorite ? 'active' : ''}`} onClick={handleToggleFavorite}>{isCurrentFavorite ? '★ In Favorites' : '☆ Save to Favorites'}</button></div>)}
              </div>
              
              {weather.sys && weather.sys.sunrise && (
                <SunriseSunsetGraph sunrise={weather.sys.sunrise} sunset={weather.sys.sunset} />
              )}
            </div>
            
            {/* REMOVED the historical weather card from here */}

            {forecast.length > 0 && (
              <div className="forecast-section">
                <div className="forecast-header">
                  <h3 className="forecast-title">Weather Forecast</h3>
                  <div className="forecast-tabs">
                    <button className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>📅 Daily</button>
                    <button className={`tab-button ${activeTab === 'hourly' ? 'active' : ''}`} onClick={() => setActiveTab('hourly')}>🕐 Hourly</button>
                  </div>
                </div>
                {activeTab === 'daily' && (
                  <div className="forecast-grid">
                    {forecast.filter((_, index) => index % 8 === 0).slice(0, 7).map((item, idx) => (
                      <div key={idx} className="forecast-card">
                        <p className="forecast-date">{new Date(item.dt_txt).toLocaleDateString([], { weekday: 'short' })}</p>
                        <div className="forecast-icon">{getWeatherEmoji(item.weather[0].main)}</div>
                        <div className="forecast-temp">
                          <span className="temp-high">{Math.round(item.main.temp_max)}°</span>
                          <span className="temp-low">{Math.round(item.main.temp_min)}°</span>
                        </div>
                        <p className="forecast-pop">Rain: 💧 {Math.round(item.pop * 100)}%</p>
                        <p className="forecast-condition">{item.weather[0].main}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'hourly' && (
                  <div className="hourly-forecast">
                    <div className="temperature-graph">
                      <h4 className="graph-title">Hourly Temperature</h4>
                      <div className="graph-container">
                        <div className="graph-bars">
                          {hourlyForecast.slice(0, 24).map((item, idx) => {
                            const temps = hourlyForecast.slice(0, 24).map(i => i.main.temp);
                            const minTemp = Math.min(...temps);
                            const maxTemp = Math.max(...temps);
                            const tempRange = maxTemp - minTemp;
                            const barHeight = tempRange > 0 ? ((item.main.temp - minTemp) / tempRange) * 100 : 50;
                            return (
                              <div key={idx} className="graph-bar-container">
                                <div className="graph-bar" style={{ height: `${barHeight}%` }}>
                                  <span className="bar-temp">{Math.round(item.main.temp)}°</span>
                                </div>
                                <span className="bar-time">{new Date(item.dt_txt).toLocaleTimeString([], { hour: 'numeric', hour12: true })}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="hourly-cards">
                      {hourlyForecast.slice(0, 8).map((item, idx) => (
                        <div key={idx} className="hourly-card">
                          <p className="hourly-time">{new Date(item.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <div className="hourly-icon">{getWeatherEmoji(item.weather[0].main)}</div>
                          <p className="hourly-temp">{Math.round(item.main.temp)}°{tempUnitLetter}</p>
                          <div className="hourly-pop">
                            <span>Rain: 💧</span>
                            <span>{Math.round(item.pop * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
  <HistoricalWeatherModal
    coords={coords}                // ✅ pass coords here
    onClose={() => setIsModalOpen(false)}
    units={units}
  />
)}
    </div>
  );
}

export default Home;