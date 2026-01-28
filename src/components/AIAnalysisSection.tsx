'use client';

import { useState } from 'react';
import { ProcessedCoinData, AIAnalysisResult, CoinAnalysis } from '@/types';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Shield,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap
} from 'lucide-react';

interface AIAnalysisSectionProps {
  marketData: ProcessedCoinData[];
}

export const AIAnalysisSection = ({ marketData }: AIAnalysisSectionProps) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (marketData.length === 0) {
      setError('No market data available. Please refresh market data first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coins: marketData }),
      });

      if (!res.ok) {
        throw new Error('Failed to get AI analysis');
      }

      const data: AIAnalysisResult = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case 'BELI':
      case 'BUY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'JUAL':
      case 'SELL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'BELI':
      case 'BUY':
        return <TrendingUp size={18} />;
      case 'JUAL':
      case 'SELL':
        return <TrendingDown size={18} />;
      default:
        return <Minus size={18} />;
    }
  };

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'RENDAH':
      case 'LOW':
        return 'text-emerald-400';
      case 'SEDANG':
      case 'MEDIUM':
        return 'text-amber-400';
      case 'TINGGI':
      case 'HIGH':
        return 'text-rose-400';
      default:
        return 'text-slate-400';
    }
  };

  const getSentimentStyle = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'BEARISH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'BULL':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'BEAR':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'NETRAL':
      case 'NEUTRAL':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const toggleExpand = (coinId: string) => {
    setExpandedCard(expandedCard === coinId ? null : coinId);
  };

  return (
    <section className="mt-12 rounded-3xl border border-slate-700/50 bg-slate-900/40 p-8 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
            <Brain className="text-violet-400" />
            AI Swing Analysis
            <span className="text-xs font-normal px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
              Powered by Gemini
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Get AI-powered swing trading recommendations with entry/exit strategies
          </p>
        </div>

        <button
          onClick={fetchAnalysis}
          disabled={isLoading || marketData.length === 0}
          className={`inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg ${
            isLoading || marketData.length === 0
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-400 hover:to-purple-400 shadow-violet-500/25'
          }`}
        >
          {isLoading ? (
            <>
              <Sparkles size={18} className="mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap size={18} className="mr-2" />
              Analyze with AI
            </>
          )}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-3 mb-6">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-400" size={24} />
          </div>
          <p className="text-slate-400 mt-4 animate-pulse">AI is analyzing market data...</p>
          <p className="text-slate-500 text-sm mt-1">This may take a few seconds</p>
        </div>
      )}

      {/* No Analysis State */}
      {!isLoading && !analysis && !error && (
        <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-slate-700">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Brain size={28} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Analysis Yet</h3>
          <p className="text-slate-400 text-center max-w-md">
            Click <span className="text-violet-400 font-semibold">"Analyze with AI"</span> to get 
            intelligent swing trading recommendations for your tracked cryptocurrencies.
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !isLoading && (
        <div className="space-y-6">
          {/* Market Sentiment Banner */}
          <div className={`p-4 rounded-xl border ${getSentimentStyle(analysis.marketSentiment)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Sentimen Pasar:</span>
                <span className="font-bold">{analysis.marketSentiment}</span>
              </div>
            </div>
            <div className="mt-2 text-sm opacity-90 prose prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: analysis.overallAdvice.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
            </div>
          </div>

          {/* Analysis Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {analysis.analysis.map((coin: CoinAnalysis) => (
              <div
                key={coin.coinId}
                className="rounded-2xl border border-slate-700/50 bg-slate-800/40 overflow-hidden transition-all hover:border-slate-600/50"
              >
                {/* Card Header */}
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => toggleExpand(coin.coinId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1.5 rounded-lg border font-bold text-sm flex items-center gap-2 ${getRecommendationStyle(coin.recommendation)}`}>
                        {getRecommendationIcon(coin.recommendation)}
                        {coin.recommendation}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{coin.coinName}</h4>
                        <span className="text-xs text-slate-400 uppercase">{coin.symbol}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Confidence</div>
                        <div className="font-bold text-white">{coin.confidence}%</div>
                      </div>
                      {coin.positionSizePercent !== undefined && (
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Position</div>
                          <div className="font-bold text-white">{coin.positionSizePercent}%</div>
                        </div>
                      )}
                      {expandedCard === coin.coinId ? (
                        <ChevronUp size={20} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={20} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <div className="text-xs text-slate-400 mb-1">Entry</div>
                      <div className="font-mono text-sm text-white">${coin.entryPrice ? coin.entryPrice.toLocaleString() : 'N/A'}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <div className="text-xs text-slate-400 mb-1">Target</div>
                      <div className="font-mono text-sm text-emerald-400">${coin.targetPrice ? coin.targetPrice.toLocaleString() : 'N/A'}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <div className="text-xs text-slate-400 mb-1">Stop Loss</div>
                      <div className="font-mono text-sm text-rose-400">${coin.stopLoss ? coin.stopLoss.toLocaleString() : 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedCard === coin.coinId && (
                  <div className="border-t border-slate-700/50 p-5 space-y-4 bg-slate-900/30">
                    {/* Risk & Timeframe */}
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className={getRiskStyle(coin.riskLevel)} />
                        <span className="text-sm text-slate-400">Risk:</span>
                        <span className={`font-semibold ${getRiskStyle(coin.riskLevel)}`}>{coin.riskLevel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-sky-400" />
                        <span className="text-sm text-slate-400">Timeframe:</span>
                        <span className="font-semibold text-sky-400">{coin.timeframe}</span>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Brain size={14} className="text-violet-400" />
                        Alasan Analisis
                      </h5>
                      <p className="text-sm text-slate-300 leading-relaxed">{coin.reasoning}</p>
                    </div>

                    {/* Swing Plan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <h6 className="text-xs font-semibold text-emerald-400 mb-2">📈 Strategi Entry</h6>
                        <p className="text-sm text-slate-300">{coin.swingPlan?.entry || coin.swingPlan?.masuk || 'Tidak ditentukan'}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <h6 className="text-xs font-semibold text-sky-400 mb-2">🎯 Strategi Exit</h6>
                        <p className="text-sm text-slate-300">{coin.swingPlan?.exit || coin.swingPlan?.keluar || 'Tidak ditentukan'}</p>
                      </div>
                      <div className="md:col-span-2 bg-slate-800/50 rounded-xl p-4">
                        <h6 className="text-xs font-semibold text-amber-400 mb-2">🛡️ Manajemen Risiko</h6>
                        <p className="text-sm text-slate-300">{coin.swingPlan?.riskManagement || coin.swingPlan?.manajemenRisiko || 'Tidak ditentukan'}</p>
                      </div>
                    </div>

                    {/* Key Levels */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h6 className="text-xs font-semibold text-emerald-400 mb-2">Level Support</h6>
                        <div className="flex flex-wrap gap-2">
                          {coin.keyLevels?.support && coin.keyLevels.support.map((level, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                              ${level ? level.toLocaleString() : 'N/A'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h6 className="text-xs font-semibold text-rose-400 mb-2">Level Resistance</h6>
                        <div className="flex flex-wrap gap-2">
                          {coin.keyLevels?.resistance && coin.keyLevels.resistance.map((level, i) => (
                            <span key={i} className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-xs font-mono">
                              ${level ? level.toLocaleString() : 'N/A'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Buy/Sell Percentage */}
                    {((coin.buyPercentage ?? 0) > 0 || (coin.sellPercentage ?? 0) > 0) && (
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <h6 className="text-xs font-semibold text-white mb-3">Alokasi Posisi Disarankan</h6>
                        <div className="flex gap-4">
                          {((coin.buyPercentage ?? 0) > 0) && (
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-emerald-400">Beli</span>
                                <span className="text-emerald-400 font-bold">{coin.buyPercentage || 0}%</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                                  style={{ width: `${coin.buyPercentage || 0}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {((coin.sellPercentage ?? 0) > 0) && (
                            <div className="flex-1">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-rose-400">Jual</span>
                                <span className="text-rose-400 font-bold">{coin.sellPercentage || 0}%</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all"
                                  style={{ width: `${coin.sellPercentage || 0}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
