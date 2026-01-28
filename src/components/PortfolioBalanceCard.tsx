'use client';

import { formatCurrency } from '@/lib/utils';
import { CryptoChart } from './CryptoChart';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Repeat2, Send } from 'lucide-react'; // Placeholder icons

interface PortfolioBalanceCardProps {
  totalBalanceUSD: number;
  chartData: number[]; // Sparkline data for the main chart
  chartColor: string;
}

export const PortfolioBalanceCard = ({ totalBalanceUSD, chartData, chartColor }: PortfolioBalanceCardProps) => {
  return (
    <div className="glass rounded-[2rem] p-8 mb-8 animate-fade-in shadow-2xl overflow-hidden relative group">
      {/* Decorative Gradient Orb */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-green/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent-green/20 transition-all duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-green/10 flex items-center justify-center border border-accent-green/20 glass-glow-green">
              <Wallet size={28} className="text-accent-green" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-text-secondary uppercase tracking-widest mb-1">Total Assets</h2>
              <p className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
                {formatCurrency(totalBalanceUSD)}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
             <button className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-accent-green text-dark-background font-bold text-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent-green/20">
              <ArrowDownCircle size={18} />
              Deposit
            </button>
            <button className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 text-text-primary font-bold text-sm border border-white/10 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2">
              <ArrowUpCircle size={18} />
              Withdraw
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Spending', value: '$1,240', icon: Send, color: 'text-sky-400', bg: 'bg-sky-400/10' },
            { label: 'Earning', value: '$4,820', icon: ArrowDownCircle, color: 'text-accent-green', bg: 'bg-accent-green/10' },
            { label: 'Profit', value: '+12.5%', icon: Repeat2, color: 'text-accent-green', bg: 'bg-accent-green/10' },
            { label: 'Risk Score', value: 'Low', icon: Wallet, color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={14} />
                </div>
                <span className="text-xs text-text-secondary font-medium">{stat.label}</span>
              </div>
              <p className="text-lg font-bold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <div className="h-64 md:h-80 -mx-4">
          <CryptoChart data={chartData} color={chartColor} type="area" />
        </div>
      </div>
    </div>
  );
};
