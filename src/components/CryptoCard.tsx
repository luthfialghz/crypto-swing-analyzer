'use client';

import { ProcessedCoinData } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { CryptoChart } from './CryptoChart';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoCardProps {
  coin: ProcessedCoinData;
}

export const CryptoCard = ({ coin }: CryptoCardProps) => {
  const isH4Positive = coin.h4_change >= 0;
  const isD1Positive = coin.price_change_percentage_24h >= 0;

  // Chart color based on H4 Trend
  const chartColor = isH4Positive ? 'rgb(52, 211, 153)' : 'rgb(248, 113, 113)'; // Emerald-400 : Rose-400
  const chartBg = isH4Positive ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-xl transition duration-300 hover:border-sky-500/30 hover:bg-slate-800/60">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <img
            src={coin.image}
            alt={coin.name}
            className="h-12 w-12 rounded-full bg-slate-700 p-1"
          />
          <div>
            <h3 className="text-lg font-bold text-white">{coin.name}</h3>
            <span className="text-xs font-medium uppercase text-slate-400 ring-1 ring-slate-600 px-2 py-0.5 rounded-full">
              {coin.symbol}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {formatCurrency(coin.current_price)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900/50 p-3 border border-slate-700/30">
          <p className="mb-1 text-xs font-medium text-slate-400">Change (H4)</p>
          <div className={`flex items-center gap-1 font-mono text-sm font-semibold ${isH4Positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isH4Positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {formatPercentage(coin.h4_change)}
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/50 p-3 border border-slate-700/30">
          <p className="mb-1 text-xs font-medium text-slate-400">Change (24h)</p>
          <div className={`flex items-center gap-1 font-mono text-sm font-semibold ${isD1Positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isD1Positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {formatPercentage(coin.price_change_percentage_24h)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative -mx-2">
         {/* Pass rgba string properly to component if needed, simplfied here */}
         <CryptoChart data={coin.sparkline_in_7d.price} color={chartColor} />
      </div>
    </div>
  );
};
