'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, Bot } from 'lucide-react';

export const SendAIAnalysisButton = () => {
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

  const sendAIAnalysis = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/send-ai-analysis-discord', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim analisis AI');
      }

      setSuccess('Analisis AI berhasil dikirim ke Discord!');
      setMessage('Analisis pasar terbaru telah dikirim ke channel Discord Anda.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim analisis AI');
      console.error('Error sending AI analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Bot size={18} className="text-violet-400" />
        Kirim Analisis AI ke Discord
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
        onClick={sendAIAnalysis}
        disabled={isLoading || !webhookConfigured || checkingConfig}
        className={`w-full py-2.5 rounded-lg font-medium transition flex items-center justify-center ${
          isLoading || !webhookConfigured || checkingConfig
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-400 hover:to-purple-400'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin mr-2" />
            Mengirim...
          </>
        ) : (
          <>
            <Bot size={18} className="mr-2" />
            Kirim Analisis AI
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
          <div className="text-slate-400 text-xs mb-1">Info:</div>
          {message}
        </div>
      )}
      
      <div className="mt-3 text-xs text-slate-500">
        <p>Mengirim analisis pasar terbaru termasuk rekomendasi AI, sentimen pasar, dan koin alternatif.</p>
      </div>
    </div>
  );
};