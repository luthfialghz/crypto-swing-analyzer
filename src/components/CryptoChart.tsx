'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useEffect, useRef } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface CryptoChartProps {
  data: number[];
  color: string;
  sparkline?: boolean; // New prop to indicate if it's a sparkline
  type?: 'line' | 'area'; // New prop to indicate chart type
}

export const CryptoChart = ({ data, color, sparkline = false, type = 'line' }: CryptoChartProps) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  const getGradient = (chart: ChartJS) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) {
      return undefined;
    }
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    
    // Convert hex to rgba if needed
    const baseColor = color.startsWith('#') ? hexToRgb(color) : color;
    const isRgb = baseColor.startsWith('rgb');

    if (isRgb) {
      gradient.addColorStop(0, baseColor.replace('rgb', 'rgba').replace(')', ', 0)'));
      gradient.addColorStop(0.5, baseColor.replace('rgb', 'rgba').replace(')', ', 0.1)'));
      gradient.addColorStop(1, baseColor.replace('rgb', 'rgba').replace(')', ', 0.2)'));
    } else {
      gradient.addColorStop(0, `${baseColor}00`);
      gradient.addColorStop(1, `${baseColor}33`);
    }
    return gradient;
  };

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : hex;
  }

  const chartData = {
    labels: data.map((_, i) => i.toString()),
    datasets: [
      {
        data: data,
        borderColor: color,
        borderWidth: sparkline ? 1.5 : 3,
        backgroundColor: type === 'area' ? (context: any) => getGradient(context.chart) : 'transparent',
        fill: type === 'area',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: sparkline ? 0 : 6,
        pointHitRadius: 10,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: any = { // Using 'any' for options due to complex conditional typing in chart.js
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: !sparkline, // Enable tooltip only for non-sparklines
        intersect: false,
        mode: 'index',
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        },
        titleFont: { family: 'Outfit', size: 14, weight: 'bold' }, // Customize tooltip font
        bodyFont: { family: 'Outfit', size: 12 },
        padding: 10,
        cornerRadius: 8,
        backgroundColor: '#1E1E1E', // Dark background for tooltip
        borderColor: '#282828', // Border color for tooltip
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: !sparkline, // Hide x-axis for sparklines
        grid: {
          display: !sparkline,
          color: '#282828', // Darker grid lines
        },
        ticks: {
          display: !sparkline,
          color: '#A3A3A3', // Text color for axis labels
        },
      },
      y: {
        display: !sparkline, // Hide y-axis for sparklines
        grid: {
          display: !sparkline,
          color: '#282828',
        },
        ticks: {
          display: !sparkline,
          color: '#A3A3A3',
          callback: function(value: any, index: any, values: any) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
          }
        },
      },
    },
    interaction: {
      intersect: false,
    },
  };

  return (
    <div className={sparkline ? "w-full h-full" : "h-64 md:h-80 w-full"}> {/* Adjust height based on sparkline */}
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};