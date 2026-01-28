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
  const chartRef = useRef<ChartJS<'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar' | 'bar' | undefined, number[], string>>(null); // Corrected generic type for ChartJS

  const getGradient = (chart: ChartJS) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) {
      return null;
    }
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, `${color.replace('rgb', 'rgba').replace(')', ', 0.0)')}`); // Transparent at bottom
    gradient.addColorStop(0.5, `${color.replace('rgb', 'rgba').replace(')', ', 0.15)')}`); // Semi-transparent in middle
    gradient.addColorStop(1, `${color.replace('rgb', 'rgba').replace(')', ', 0.3)')}`); // More opaque at top
    return gradient;
  };

  const chartData = {
    labels: data.map((_, i) => i.toString()), // Use index as label, will be hidden for sparklines
    datasets: [
      {
        data: data,
        borderColor: color,
        borderWidth: sparkline ? 1 : 2,
        backgroundColor: type === 'area' ? (context: any) => getGradient(context.chart) : color.replace(')', ', 0.1)').replace('rgb', 'rgba'), // Use gradient for area
        fill: type === 'area',
        tension: sparkline ? 0.2 : 0.4, // Less tension for sparklines
        pointRadius: sparkline ? 0 : 3, // Hide points for sparklines
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverRadius: sparkline ? 0 : 5,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#fff',
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