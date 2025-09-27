import React, { useState } from 'react';
import './HistoricalWeatherModal.css';

const HistoricalWeatherModal = ({ coords, onClose, units }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHistoricalWeather = async () => {
    if (!coords) {
      setError('Location coordinates are missing. Please search for a city first.');
      return;
    }
    if (!selectedDate) {
      setError('Please select a date.');
      return;
    }

    setError('');
    setLoading(true);
    setData(null);

    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
    const dateTimestamp = Math.floor(new Date(selectedDate).getTime() / 1000);
    const url = `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${coords.lat}&lon=${coords.lon}&dt=${dateTimestamp}&appid=${apiKey}&units=${units}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Could not fetch data for this date. Note: Only past 5 days are available.');
      const result = await res.json();

      // ✅ FIX: Use `hourly` instead of `data`
      const hourlyData = result.hourly;
      if (Array.isArray(hourlyData) && hourlyData.length > 0) {
        const totalTemp = hourlyData.reduce((sum, hour) => sum + hour.temp, 0);
        const avgTemp = totalTemp / hourlyData.length;

        const totalHumidity = hourlyData.reduce((sum, hour) => sum + hour.humidity, 0);
        const avgHumidity = totalHumidity / hourlyData.length;

        const totalWind = hourlyData.reduce((sum, hour) => sum + hour.wind_speed, 0);
        const avgWind = totalWind / hourlyData.length;

        const conditions = hourlyData.map(hour => hour.weather[0].main);
        const modeCondition = conditions.sort(
          (a, b) =>
            conditions.filter(v => v === a).length -
            conditions.filter(v => v === b).length
        ).pop();

        const dailySummary = {
          temp: avgTemp,
          humidity: avgHumidity,
          wind_speed: avgWind,
          weather: [{ main: modeCondition }],
        };

        setData(dailySummary);
      } else {
        setData(null);
        setError('No historical data found for this date.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch historical data.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const tempUnit = units === 'metric' ? 'C' : 'F';
  const windUnit = units === 'metric' ? 'm/s' : 'mph';
  const displayDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">×</button>
        <div className="modal-header">
          <h2 className="modal-title">Historical Weather</h2>
          <p className="modal-subtitle">Select a past date to retrieve data.</p>
        </div>

        <div className="modal-body">
          <div className="modal-picker">
            <input
  type="date"
  className="modal-date-input"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  max={new Date().toISOString().split("T")[0]}
  min={new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} // ✅ only last 5 days
/>

            <button
              className="modal-history-btn"
              onClick={fetchHistoricalWeather}
              disabled={loading || !selectedDate}
            >
              {loading ? 'Fetching...' : 'Get History'}
            </button>
          </div>

          {error && <p className="modal-error">{error}</p>}
          {loading && <div className="modal-spinner"></div>}

          {data && (
            <div className="modal-results">
              <p className="modal-results-date">Showing results for {displayDate}</p>
              <div className="modal-grid">
                <div className="modal-detail-item">
                  <span className="modal-detail-value">{Math.round(data.temp)}°{tempUnit}</span>
                  <span className="modal-detail-label">Avg. Temperature</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-value">{data.weather[0].main}</span>
                  <span className="modal-detail-label">Condition</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-value">{Math.round(data.humidity)}%</span>
                  <span className="modal-detail-label">Avg. Humidity</span>
                </div>
                <div className="modal-detail-item">
                  <span className="modal-detail-value">{data.wind_speed.toFixed(1)} {windUnit}</span>
                  <span className="modal-detail-label">Avg. Wind Speed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricalWeatherModal;
