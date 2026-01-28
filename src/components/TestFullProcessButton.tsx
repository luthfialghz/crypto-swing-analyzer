'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, Zap, Bot } from 'lucide-react';

export const TestFullProcessButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);

  // Cek status konfigurasi saat komponen dimuat
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/check-webhook-config');
        const data = await response.json();
        setWebhookConfigured(data.webhookConfigured);
      } catch (err) {
        console.error('Error checking webhook config:', err);
        setWebhookConfigured(false);
      } finally {
        setCheckingConfig(false);
      }
    };

    checkConfig();
  }, []);

  const testFullProcess = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/test-full-process', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menguji proses lengkap');
      }

      setSuccess('Proses lengkap berhasil diuji! Lihat channel Discord Anda.');
      setMessage(`Langkah-langkah berhasil: ${result.steps.fetchMarketData}, ${result.steps.aiAnalysis}, ${result.steps.sendToDiscord}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menguji proses lengkap');
      console.error('Error testing full process:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Zap size={18} className="text-yellow-400" />
        Uji Proses Lengkap
      </h3>
      
      <div className="mb-3">
        <label className="block text-sm text-slate-400 mb-1">Status Konfigurasi</label>
        <input
          type="text"
          value={checkingConfig ? 'Memeriksa...' : (webhookConfigured ? 'Sudah Dikonfigurasi' : 'Belum Dikonfigurasi')}
          readOnly
          className={`w-full px-3 py-2 rounded-lg border text-slate-300 cursor-not-allowed ${
            webhookConfigured 
              ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' 
              : checkingConfig
                ? 'bg-slate-700 border-slate-600 text-slate-400'
                : 'bg-rose-900/20 border-rose-500/30 text-rose-400'
          }`}
        />
        <p className="text-xs text-slate-500 mt-1">
          Status diambil dari konfigurasi sistem
        </p>
      </div>

      <button
        onClick={testFullProcess}
        disabled={isLoading || !webhookConfigured || checkingConfig}
        className={`w-full py-2.5 rounded-lg font-medium transition flex items-center justify-center ${
          isLoading || !webhookConfigured || checkingConfig
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-400 hover:to-orange-400'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin mr-2" />
            Menguji...
          </>
        ) : (
          <>
            <Zap size={18} className="mr-2" />
            Uji Proses Lengkap
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      {message && (
        <div className="mt-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-300 text-xs">
          <div className="text-slate-400 text-xs mb-1">Langkah-langkah:</div>
          {message}
        </div>
      )}
      
      <div className="mt-3 text-xs text-slate-500">
        <p>Uji keseluruhan proses: Fetch Market Data → AI Analyzer Process → Send to Discord</p>
      </div>
    </div>
  );
};