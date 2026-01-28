export interface Sparkline {
  price: number[];
}

export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: Sparkline;
  last_updated: string;
}

export interface ProcessedCoinData extends CoinData {
  h4_change: number;
}

// AI Analysis Types
export interface SwingPlan {
  strategy: string;
  entry: string;
  exit: string;
  riskManagement: string;
  // Indonesian equivalents
  strategi?: string;
  masuk?: string;
  keluar?: string;
  manajemenRisiko?: string;
}

export interface KeyLevels {
  support: number[];
  resistance: number[];
}

export interface AlternativeCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  h4_change: number;
  image: string;
  reasoning: string; // Why this coin is recommended as alternative
}

export interface CoinAnalysis {
  coinId: string;
  coinName: string;
  symbol: string;
  recommendation: 'BELI' | 'JUAL' | 'TAHAN';
  confidence: number;
  positionSizePercent?: number;
  buyPercentage?: number;
  sellPercentage?: number;
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  timeframe: string;
  reasoning: string;
  swingPlan?: SwingPlan;
  riskLevel: 'RENDAH' | 'SEDANG' | 'TINGGI';
  keyLevels?: KeyLevels;
  alternativeCoins?: AlternativeCoin[]; // Rekomendasi koin alternatif dari AI
}

export interface AIAnalysisResult {
  analysis: CoinAnalysis[];
  marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  overallAdvice: string;
}
