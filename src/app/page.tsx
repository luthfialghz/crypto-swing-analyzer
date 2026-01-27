'use client';

import { useCryptoData } from '@/hooks/useCryptoData';
import { CryptoCard } from '@/components/CryptoCard';
import { PortfolioSection } from '@/components/PortfolioSection';
import { AIAnalysisSection } from '@/components/AIAnalysisSection';
import { Share2, Activity, Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';

export default function Home() {
  const { data, status, lastUpdated, isLoading, idrRate, isRefreshing, refresh } = useCryptoData();

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
    <main className="min-h-screen px-6 py-10 max-w-7xl mx-auto">
      
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 rounded-3xl border border-slate-700/50 bg-slate-800/40 p-8 backdrop-blur-xl">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 mb-2">
            Crypto Swing Analyzer
          </h1>
          <p className="text-slate-400 flex items-center gap-2">
            <Activity size={16} className="text-sky-400" />
            Visualisasi Data Pasar Realtime (H4 & D1)
          </p>
          <a
            href="/settings"
            className="mt-2 inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            Konfigurasi Koin Target
            <Share2 size={14} className="ml-1" />
          </a>
        </div>

        <div className="flex flex-col items-end gap-3">
          {getStatusBadge()}

          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className={`inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border shadow-lg ${
              isRefreshing
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 cursor-not-allowed'
                : 'bg-sky-500/20 text-sky-400 border-sky-500/30 hover:bg-sky-500/30 hover:border-sky-500/50'
            }`}
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Fetching...' : 'Refresh Data'}
          </button>

          <p className="text-xs font-mono text-slate-500">
            LAST UPDATE: <span className="text-slate-300">{lastUpdated}</span>
          </p>
        </div>
      </header>

      {/* Grid Content */}
      {isRefreshing && data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 animate-pulse">Initializing quantum link...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
            <RefreshCw size={32} className="text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Data Loaded</h3>
          <p className="text-slate-400 text-center max-w-md mb-6">
            Click the <span className="text-sky-400 font-semibold">"Refresh Data"</span> button above to fetch the latest cryptocurrency market data from CoinGecko API.
          </p>
          <button
            onClick={refresh}
            className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:from-sky-400 hover:to-indigo-400 transition-all shadow-lg shadow-sky-500/25"
          >
            <RefreshCw size={18} className="mr-2" />
            Fetch Market Data
          </button>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((coin) => (
                <CryptoCard key={coin.id} coin={coin} />
              ))}
            </div>
            
            {/* AI Analysis Section */}
            <AIAnalysisSection marketData={data} />
            
            {/* Portfolio Section */}
            <PortfolioSection marketData={data} idrRate={idrRate} />
        </>
      )}

       {/* Footer */}
       <footer className="mt-20 text-center text-slate-600 text-sm">
        <p>Built with Next.js 14 & Tailwind CSS</p>
      </footer>
    </main>
  );
}

