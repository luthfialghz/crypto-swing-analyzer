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
}

export const CryptoChart = ({ data, color }: CryptoChartProps) => {
  const chartData = {
    labels: data.map(() => ''),
    datasets: [
      {
        fill: true,
        data: data,
        borderColor: color,
        borderWidth: 2,
        backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'), // Simple alpha replace hack or passed prop
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    interaction: {
      intersect: false,
    },
  };

  return (
    <div className="h-32 w-full mt-4">
      <Line data={chartData} options={options} />
    </div>
  );
};
