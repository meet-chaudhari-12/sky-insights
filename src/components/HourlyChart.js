import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HourlyChart = ({ hourlyData, tempUnit }) => {
  const chartData = {
    labels: hourlyData.map(item => new Date(item.dt_txt).toLocaleTimeString([], { hour: 'numeric', hour12: true })),
    datasets: [
      {
        label: `Temperature (°${tempUnit})`,
        data: hourlyData.map(item => Math.round(item.main.temp)),
        fill: true,
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: '#667eea',
        tension: 0.4,
        pointBackgroundColor: '#667eea',
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          callback: function (value) {
            return value + '°';
          },
        },
      },
    },
  };

  return (
    <div className="temperature-graph">
      <h4 className="graph-title">Compare Hourly Temperature</h4>
      <div className="graph-container">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default HourlyChart;