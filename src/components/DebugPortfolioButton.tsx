'use client';

import { useState } from 'react';
import { Bug, FileJson, AlertCircle, CheckCircle } from 'lucide-react';

export const DebugPortfolioButton = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDebug = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDebugInfo(data);
    } catch (err: any) {
      console.error('Debug fetch failed:', err);
      setError(err.message || 'Failed to fetch debug data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleDebug}
        disabled={isLoading}
        className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all font-bold text-xs uppercase tracking-widest active:scale-95 disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <Bug size={18} />
          {isLoading ? 'Inspecting Data...' : 'Debug Portfolio JSON'}
        </div>
        <FileJson size={18} className="opacity-50" />
      </button>

      {error && (
        <div className="p-4 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-[10px] font-bold flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {debugInfo && (
        <div className="p-6 rounded-2xl bg-black/40 border border-white/10 animate-fade-in font-mono text-[10px] overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
             <span className="text-text-secondary uppercase tracking-widest">Snapshot Result</span>
             <CheckCircle size={14} className="text-accent-green" />
          </div>
          <pre className="text-white overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          <div className="mt-4 pt-4 border-t border-white/5 text-[9px] text-text-secondary italic">
            * This is the raw data being retrieved by the API from portfolio.json
          </div>
        </div>
      )}
    </div>
  );
};
