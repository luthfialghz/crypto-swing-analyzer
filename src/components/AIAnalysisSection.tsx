'use client';

import { useState, useEffect } from 'react';
import { ProcessedCoinData, AIAnalysisResult, CoinAnalysis, AlternativeCoin } from '@/types';
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
  Zap,
  RotateCcw
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
    <section className="glass rounded-[2rem] p-8 animate-fade-in relative overflow-hidden group">
       {/* Decorative Gradient Orb */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/20 transition-all duration-700"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Brain className="text-violet-400" size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white tracking-tight">AI Swing Analysis</h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-400 border border-violet-500/30">
                Gemini Pro
              </span>
            </div>
            <p className="text-text-secondary text-sm">
              Quantum-powered market insights & strategies
            </p>
          </div>
        </div>

        <button
          onClick={fetchAnalysis}
          disabled={isLoading || marketData.length === 0}
          className={`group/btn relative inline-flex items-center px-8 py-4 rounded-2xl text-sm font-bold transition-all overflow-hidden ${
            isLoading || marketData.length === 0
              ? 'bg-white/5 text-text-secondary cursor-not-allowed border border-white/5'
              : 'bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <Sparkles size={18} className="mr-2 animate-spin" />
              Processing Data...
            </>
          ) : (
            <>
              <Zap size={18} className="mr-2 transition-transform group-hover/btn:scale-125" />
              Generate Analysis
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
        <div className="flex flex-col items-center justify-center py-16 rounded-[2rem] border border-dashed border-white/5 bg-white/[0.02]">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 shadow-2xl border border-white/10">
            <Brain size={32} className="text-text-secondary opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Quantum Engine Idle</h3>
          <p className="text-text-secondary text-center max-w-sm text-sm font-medium">
            Initiate the <span className="text-violet-400 font-bold">Generate Analysis</span> protocol to 
            receive real-time swing trading vectors.
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {analysis.analysis.map((coin: CoinAnalysis) => {
              // Get alternative coins from AI analysis
              const alternativeCoins = coin.alternativeCoins || [];

              return (
                <div
                  key={coin.coinId}
                  className="rounded-[2rem] border border-white/5 bg-white/5 overflow-hidden transition-all hover:bg-white/[0.08] hover:border-white/10 group/card"
                >
                  {/* Card Header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleExpand(coin.coinId)}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm ${getRecommendationStyle(coin.recommendation)}`}>
                          {getRecommendationIcon(coin.recommendation)}
                          {coin.recommendation}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg tracking-tight">{coin.coinName}</h4>
                          <span className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{coin.symbol}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10px] text-text-secondary font-black uppercase tracking-widest mb-1">Confidence</div>
                          <div className="font-mono font-bold text-white">{coin.confidence}%</div>
                        </div>
                        {expandedCard === coin.coinId ? (
                          <ChevronUp size={20} className="text-text-secondary group-hover/card:text-white transition-colors" />
                        ) : (
                          <ChevronDown size={20} className="text-text-secondary group-hover/card:text-white transition-colors" />
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Entry', value: coin.entryPrice, color: 'text-white' },
                        { label: 'Target', value: coin.targetPrice, color: 'text-accent-green' },
                        { label: 'Stop Loss', value: coin.stopLoss, color: 'text-accent-red' }
                      ].map((stat, i) => (
                        <div key={i} className="bg-black/20 rounded-2xl p-3 border border-white/5">
                          <div className="text-[10px] text-text-secondary font-black uppercase tracking-widest mb-1">{stat.label}</div>
                          <div className={`font-mono text-sm font-bold ${stat.color}`}>
                            ${stat.value ? stat.value.toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedCard === coin.coinId && (
                    <div className="border-t border-white/5 p-6 space-y-6 bg-black/40 animate-fade-in">
                      {/* Risk & Timeframe */}
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <Shield size={16} className={getRiskStyle(coin.riskLevel)} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Risk:</span>
                          <span className={`text-xs font-black uppercase tracking-widest ${getRiskStyle(coin.riskLevel)}`}>{coin.riskLevel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-accent-blue" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Horizon:</span>
                          <span className="text-xs font-bold text-accent-blue uppercase tracking-widest">{coin.timeframe}</span>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-3 flex items-center gap-2">
                          <Brain size={12} />
                          Analysis Core
                        </h5>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium italic">{coin.reasoning}</p>
                      </div>

                      {/* Swing Plan */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10">
                          <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-green mb-3">📈 Entry Protocol</h6>
                          <p className="text-sm text-text-secondary font-medium leading-relaxed">{coin.swingPlan?.entry || coin.swingPlan?.masuk || 'Undefined'}</p>
                        </div>
                        <div className="bg-accent-blue/5 rounded-2xl p-5 border border-accent-blue/10">
                          <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue mb-3">🎯 Exit Strategy</h6>
                          <p className="text-sm text-text-secondary font-medium leading-relaxed">{coin.swingPlan?.exit || coin.swingPlan?.keluar || 'Undefined'}</p>
                        </div>
                        <div className="md:col-span-2 bg-amber-500/5 rounded-2xl p-5 border border-amber-500/10">
                          <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-3">🛡️ Risk Mitigation</h6>
                          <p className="text-sm text-text-secondary font-medium leading-relaxed">{coin.swingPlan?.riskManagement || coin.swingPlan?.manajemenRisiko || 'Undefined'}</p>
                        </div>
                      </div>

                      {/* Key Levels */}
                      <div className="grid grid-cols-2 gap-6 pb-2">
                        <div>
                          <h6 className="text-[10px] font-black uppercase tracking-widest text-accent-green mb-3 flex items-center gap-2">
                            <TrendingUp size={12} /> Support Levels
                          </h6>
                          <div className="flex flex-wrap gap-2">
                            {coin.keyLevels?.support && coin.keyLevels.support.map((level, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-accent-green/10 text-accent-green text-[10px] font-mono font-bold border border-accent-green/20">
                                ${level ? level.toLocaleString() : 'N/A'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-[10px] font-black uppercase tracking-widest text-accent-red mb-3 flex items-center gap-2">
                            <TrendingDown size={12} /> Resistance Levels
                          </h6>
                          <div className="flex flex-wrap gap-2">
                            {coin.keyLevels?.resistance && coin.keyLevels.resistance.map((level, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-accent-red/10 text-accent-red text-[10px] font-mono font-bold border border-accent-red/20">
                                ${level ? level.toLocaleString() : 'N/A'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Buy/Sell Percentage */}
                      {((coin.buyPercentage ?? 0) > 0 || (coin.sellPercentage ?? 0) > 0) && (
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                          <h6 className="text-[10px] font-black uppercase tracking-widest text-white mb-4">Capital Allocation</h6>
                          <div className="flex gap-6">
                            {((coin.buyPercentage ?? 0) > 0) && (
                              <div className="flex-1">
                                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                  <span className="text-accent-green">Buy Side</span>
                                  <span className="text-accent-green">{coin.buyPercentage || 0}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-accent-green rounded-full shadow-[0_0_10px_rgba(37,229,126,0.5)] transition-all"
                                    style={{ width: `${coin.buyPercentage || 0}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {((coin.sellPercentage ?? 0) > 0) && (
                              <div className="flex-1">
                                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                  <span className="text-accent-red">Sell Side</span>
                                  <span className="text-accent-red">{coin.sellPercentage || 0}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-accent-red rounded-full shadow-[0_0_10px_rgba(255,75,127,0.5)] transition-all"
                                    style={{ width: `${coin.sellPercentage || 0}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Alternative Coins Section */}
                      {alternativeCoins.length > 0 && (
                        <div className="mt-4 pt-6 border-t border-white/10">
                          <h6 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                            <RotateCcw size={14} /> Alternative Opportunities
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {alternativeCoins.map((altCoin: AlternativeCoin, index) => (
                              <div
                                key={`${coin.coinId}-alt-${index}`}
                                className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                              >
                                <div className="flex items-center gap-3 mb-4">
                                  <img src={altCoin.image} alt={altCoin.symbol} className="w-8 h-8 rounded-full" />
                                  <span className="font-bold text-white text-sm">{altCoin.symbol}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest">
                                  <div>
                                    <span className="text-text-secondary block mb-1">H4</span>
                                    <span className={altCoin.h4_change >= 0 ? 'text-accent-green' : 'text-accent-red'}>
                                      {altCoin.h4_change >= 0 ? '+' : ''}{altCoin.h4_change.toFixed(2)}%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-text-secondary block mb-1">24H</span>
                                    <span className={altCoin.price_change_percentage_24h >= 0 ? 'text-accent-green' : 'text-accent-red'}>
                                      {altCoin.price_change_percentage_24h >= 0 ? '+' : ''}{altCoin.price_change_percentage_24h.toFixed(2)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  );
};
