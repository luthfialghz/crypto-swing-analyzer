'use client';

import { ProcessedCoinData } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { CryptoChart } from './CryptoChart';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CryptoCardProps {
  coin: ProcessedCoinData;
  holding?: { amount: number; avgBuyPrice: number };
}

export const CryptoCard = ({ coin, holding }: CryptoCardProps) => {
  const isD1Positive = coin.price_change_percentage_24h >= 0;

  // Chart color based on D1 Trend for sparkline consistency
  const chartColor = isD1Positive ? '#25E57E' : '#FF4B7F'; // accent-green : accent-red

  // P&L calculation if holding is provided
  const pnl = holding ? (() => {
    const currentValue = holding.amount * coin.current_price;
    const costBasis = holding.amount * holding.avgBuyPrice;
    const pnlUSD = currentValue - costBasis;
    const pnlPercent = costBasis !== 0 ? (pnlUSD / costBasis) * 100 : 0;
    return { currentValue, costBasis, pnlUSD, pnlPercent };
  })() : null;

  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.08] transition-all group animate-fade-in relative overflow-hidden">
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <img
            src={coin.image}
            alt={coin.name}
            className="h-10 w-10 rounded-full flex-shrink-0 relative z-10"
          />
          <div className={`absolute -inset-1 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity ${isD1Positive ? 'bg-accent-green' : 'bg-accent-red'}`}></div>
        </div>
        <div>
          <h3 className="text-white font-bold tracking-tight">{coin.name}</h3>
          <span className="text-text-secondary text-xs uppercase font-bold tracking-widest">{coin.symbol}</span>
          {pnl && (
            <div className={`text-xs font-bold mt-0.5 ${pnl.pnlUSD >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
              {pnl.pnlUSD >= 0 ? '+' : ''}{formatCurrency(pnl.pnlUSD)} ({pnl.pnlPercent >= 0 ? '+' : ''}{pnl.pnlPercent.toFixed(2)}%)
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8 relative z-10">
        {/* Sparkline Chart */}
        <div className="hidden md:block h-10 w-24 opacity-80 group-hover:opacity-100 transition-opacity">
          <CryptoChart data={coin.sparkline_in_7d.price} color={chartColor} sparkline={true} />
        </div>

        <div className="text-right">
          <div className="text-white font-mono font-bold tracking-tighter">{formatCurrency(coin.current_price)}</div>
          <div className={`flex items-center justify-end gap-1.5 text-xs font-black uppercase tracking-widest ${isD1Positive ? 'text-accent-green' : 'text-accent-red'}`}>
            {isD1Positive ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
            {formatPercentage(coin.price_change_percentage_24h)}
          </div>
          {pnl && (
            <div className="text-[10px] text-text-secondary mt-0.5">
              {formatCurrency(pnl.currentValue)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
