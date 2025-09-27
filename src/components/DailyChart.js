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

const DailyChart = ({ dailyData, tempUnit }) => {
  // ... all the chart logic and JSX
  const chartData = {
    labels: dailyData.map(item => new Date(item.dt_txt).toLocaleDateString([], { weekday: 'short' })),
    datasets: [
      {
        label: `High (°${tempUnit})`,
        data: dailyData.map(item => Math.round(item.main.temp_max)),
        fill: false,
        borderColor: '#ef4444',
        tension: 0.4,
        pointBackgroundColor: '#ef4444',
      },
      {
        label: `Low (°${tempUnit})`,
        data: dailyData.map(item => Math.round(item.main.temp_min)),
        fill: false,
        borderColor: '#3b82f6',
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
      <h4 className="graph-title">7-Day Temperature Trend</h4>
      <div className="graph-container">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default DailyChart;