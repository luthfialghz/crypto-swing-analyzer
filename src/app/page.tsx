'use client';

import { useState, useEffect } from 'react';
import { useCryptoData } from '@/hooks/useCryptoData';
import { PortfolioSection } from '@/components/PortfolioSection';
import { AIAnalysisSection } from '@/components/AIAnalysisSection';
import { TestNotificationButton } from '@/components/TestNotificationButton';
import { SendAIAnalysisButton } from '@/components/SendAIAnalysisButton';
import { TestFullProcessButton } from '@/components/TestFullProcessButton';
import { Settings, Activity, Wifi, WifiOff, RefreshCw, Clock, Send, Bot, Zap, Wallet, Brain } from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { PortfolioBalanceCard } from '@/components/PortfolioBalanceCard';

export default function Home() {
  const { data, status, lastUpdated, isLoading, idrRate, isRefreshing, refresh } = useCryptoData();
  const { usdtBalance, holdings } = usePortfolio();
  const [nextRefreshIn, setNextRefreshIn] = useState(60);

  // Countdown timer for auto-refresh
  useEffect(() => {
    setNextRefreshIn(60);
    const countdown = setInterval(() => {
      setNextRefreshIn(prev => {
        if (prev <= 1) return 60;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [lastUpdated]);

  // Calculate total portfolio value
  const calculateTotalPortfolioValue = () => {
    let total = usdtBalance;
    holdings.forEach(h => {
        const coin = data.find(c => c.id === h.id);
        if (coin) {
            total += h.amount * coin.current_price;
        }
    });
    return total;
  };

  const totalPortfolioValue = calculateTotalPortfolioValue();

  // Real portfolio stats
  const totalInvested = holdings.reduce((sum, h) => sum + h.amount * h.avgBuyPrice, 0);
  const currentHoldingsValue = holdings.reduce((sum, h) => {
    const coin = data.find(c => c.id === h.id);
    return sum + (coin ? h.amount * coin.current_price : 0);
  }, 0);
  const profitPercent = totalInvested > 0
    ? ((currentHoldingsValue - totalInvested) / totalInvested) * 100
    : 0;
  const riskScore = holdings.length === 1 ? 'Tinggi' : holdings.length <= 3 ? 'Sedang' : 'Rendah';

  // Aggregate sparkline data for portfolio chart
  const portfolioChartData = (() => {
    if (data.length === 0 || holdings.length === 0) {
      return Array(30).fill(0);
    }

    const firstCoinWithSparkline = data.find(coin => coin.sparkline_in_7d?.price?.length > 0);
    if (!firstCoinWithSparkline) {
      return Array(30).fill(0);
    }

    const sparklineLength = firstCoinWithSparkline.sparkline_in_7d.price.length;
    const aggregatedValues = Array(sparklineLength).fill(0);

    holdings.forEach(holding => {
      const coin = data.find(c => c.id === holding.id);
      if (coin && coin.sparkline_in_7d?.price) {
        coin.sparkline_in_7d.price.forEach((price, index) => {
          if (index < sparklineLength) {
            aggregatedValues[index] += holding.amount * price;
          }
        });
      }
    });

    return aggregatedValues.map(value => value + usdtBalance);
  })();

  const mainChartColor = totalPortfolioValue >= (portfolioChartData[0] || 0) ? 'rgb(52, 211, 153)' : 'rgb(239, 68, 68)';

  const getStatusBadge = () => {
    switch (status) {
      case 'ONLINE':
        return (
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border shadow-lg bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10">
            <Wifi size={14} className="mr-2 animate-pulse" />
            SYSTEM ONLINE
          </div>
        );
      case 'OFFLINE':
        return (
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border shadow-lg bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10">
            <WifiOff size={14} className="mr-2" />
            CONNECTION FAILED
          </div>
        );
      default: // IDLE
        return (
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border shadow-lg bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-slate-500/10">
            <Clock size={14} className="mr-2" />
            AWAITING FETCH
          </div>
        );
    }
  };

  return (
      <div className="flex min-h-screen">
        {/* Sidebar Nav */}
        <aside className="hidden lg:flex flex-col w-20 xl:w-64 glass border-r border-white/5 py-8 px-4 fixed h-full z-50">
          <div className="flex items-center gap-3 px-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-accent-green flex items-center justify-center shadow-lg shadow-accent-green/20">
              <Zap className="text-dark-background" size={24} />
            </div>
            <span className="hidden xl:block font-extrabold text-xl tracking-tighter text-white">Quantum<span className="text-accent-green">Swing</span></span>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { icon: Activity, label: 'Dashboard', active: true },
              { icon: Wallet, label: 'Portfolio', active: false },
              { icon: Brain, label: 'AI Strategy', active: false },
              { icon: Bot, label: 'Markets', active: false },
              { icon: Send, label: 'Alerts', active: false },
            ].map((item, i) => (
              <a
                key={i}
                href="#"
                className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-300 group ${
                  item.active ? 'bg-accent-green/10 text-accent-green' : 'text-text-secondary hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={22} className={item.active ? 'drop-shadow-[0_0_8px_rgba(37,229,126,0.5)]' : ''} />
                <span className="hidden xl:block font-medium text-sm">{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-white/5">
            <a href="/settings" className="flex items-center gap-4 px-3 py-3 rounded-2xl text-text-secondary hover:bg-white/5 hover:text-white transition-all">
               <Settings size={22} />
               <span className="hidden xl:block font-medium text-sm">Settings</span>
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-20 xl:ml-64 px-6 md:px-10 py-10 max-w-[1600px] mx-auto w-full">
          {/* Top Header */}
          <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Market <span className="text-accent-blue">Overview</span>
                </h1>
                {getStatusBadge()}
              </div>
              <p className="text-text-secondary font-medium flex items-center gap-2">
                <Clock size={16} className="text-accent-blue" />
                Last updated: {lastUpdated}
                {status === 'ONLINE' && (
                  <span className="text-xs text-text-secondary/60 ml-2">· Refresh in {nextRefreshIn}s</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className={`group relative flex items-center px-6 py-3 rounded-2xl font-bold text-sm transition-all overflow-hidden ${
                  isRefreshing
                    ? 'bg-white/5 text-text-secondary cursor-not-allowed'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-95'
                }`}
              >
                <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Syncing...' : 'Refresh Data'}
              </button>
            </div>
          </header>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-accent-blue/20 rounded-full"></div>
                <div className="absolute top-0 w-20 h-20 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-8 text-xl font-bold text-white tracking-tight animate-pulse">Initializing Quantum Link...</p>
              <p className="mt-2 text-text-secondary">Accessing market signals...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="glass rounded-[3rem] p-16 flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-accent-blue/10 flex items-center justify-center mb-8 border border-accent-blue/20">
                <Activity size={48} className="text-accent-blue" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 italic">No Data Stream Detected</h3>
              <p className="text-text-secondary max-w-lg text-lg mb-10">
                Establish a connection to the global crypto markets to begin monitoring your portfolio and generating AI insights.
              </p>
              <button
                onClick={refresh}
                className="px-10 py-5 rounded-[2rem] bg-accent-blue text-white font-black text-lg hover:brightness-110 shadow-2xl shadow-accent-blue/40 active:scale-95 transition-all"
              >
                Establish Connection
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {/* Top Row: Balance and Market Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
                {/* Portfolio Info */}
                <div className="lg:col-span-8">
                  <PortfolioBalanceCard
                    totalBalanceUSD={totalPortfolioValue}
                    chartData={portfolioChartData}
                    chartColor={mainChartColor}
                    totalInvested={totalInvested}
                    currentHoldingsValue={currentHoldingsValue}
                    profitPercent={profitPercent}
                    riskScore={riskScore}
                  />
                </div>

                {/* Quick Info / Market Sentiment Summary */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                   <div className="glass rounded-[2rem] p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-accent-blue/10 rounded-2xl border border-accent-blue/20">
                        <Activity size={24} className="text-accent-blue" />
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Market Status</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">System Pulse</span>
                        <span className="text-accent-green font-bold">OPTIMAL</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Data Integrity</span>
                        <span className="text-accent-blue font-bold">100%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Network Latency</span>
                        <span className="text-white font-mono">24ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings Link Card */}
                  <a
                    href="/settings"
                    className="glass rounded-[2rem] p-8 hover:bg-white/10 transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20 group-hover:bg-violet-500/20 transition-all">
                        <Settings size={24} className="text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold tracking-tight">Configurations</h3>
                        <p className="text-xs text-text-secondary">Manage koin target & logs</p>
                      </div>
                    </div>
                    <Send size={18} className="text-text-secondary group-hover:text-white transition-all transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>

              {/* Middle Section: Full Width AI Analysis */}
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <AIAnalysisSection marketData={data} />
              </div>

              {/* Bottom Section: Active Tracks (Holdings) */}
              <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                <PortfolioSection marketData={data} idrRate={idrRate} />
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-20 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-text-secondary text-sm">
            <p className="font-medium">© 2026 QuantumSwing Analyzer. All systems operational.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">API Status</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </footer>
        </main>
      </div>
  );
}
