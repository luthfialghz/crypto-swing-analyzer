import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Cache untuk menyimpan hasil analisis AI
// Format: { [cacheKey: string]: { data: any, timestamp: number } }
const analysisCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 menit cache

// Sistem pelacakan kuota harian dan per menit
let dailyQuotaUsed = 0;
let minuteQuotaUsed = 0;
const DAILY_QUOTA_LIMIT = 100; // Batas RPD untuk Gemini 2.5 Pro Free Tier
const MINUTE_QUOTA_LIMIT = 1; // Batas per menit untuk Free Tier (dikurangi agar tetap dalam batas)
const QUOTA_RESET_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik
const MINUTE_RESET_TIME = 60 * 1000; // 1 menit dalam milidetik
let lastQuotaReset = Date.now();
let lastMinuteReset = Date.now();

interface CoinAnalysisRequest {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  h4_change: number;
  sparkline_in_7d: { price: number[] };
}

// Fungsi untuk mereset kuota harian
function resetDailyQuotaIfNeeded() {
  const now = Date.now();
  if (now - lastQuotaReset >= QUOTA_RESET_TIME) {
    dailyQuotaUsed = 0;
    console.log('Daily quota reset');
    lastQuotaReset = now;
  }
}

// Fungsi untuk mereset kuota per menit
function resetMinuteQuotaIfNeeded() {
  const now = Date.now();
  if (now - lastMinuteReset >= MINUTE_RESET_TIME) {
    minuteQuotaUsed = 0;
    lastMinuteReset = now;
  }
}

// Fungsi untuk memeriksa apakah kuota tersedia
function isQuotaAvailable(): boolean {
  resetDailyQuotaIfNeeded();
  resetMinuteQuotaIfNeeded();
  return dailyQuotaUsed < DAILY_QUOTA_LIMIT && minuteQuotaUsed < MINUTE_QUOTA_LIMIT;
}

// Fungsi untuk menggunakan satu unit kuota
function consumeQuota(): void {
  dailyQuotaUsed++;
  minuteQuotaUsed++;
  console.log(`Quota used: ${dailyQuotaUsed}/${DAILY_QUOTA_LIMIT} (daily), ${minuteQuotaUsed}/${MINUTE_QUOTA_LIMIT} (minute)`);
}

export async function POST(request: NextRequest) {
  try {
    // Reset kuota jika waktunya sudah habis
    resetDailyQuotaIfNeeded();

    // Periksa apakah kuota masih tersedia
    if (!isQuotaAvailable()) {
      return NextResponse.json(
        {
          error: 'Daily quota exceeded. Please try again tomorrow.',
          quotaInfo: {
            used: dailyQuotaUsed,
            limit: DAILY_QUOTA_LIMIT,
            resetAfter: Math.ceil((QUOTA_RESET_TIME - (Date.now() - lastQuotaReset)) / (1000 * 60))
          }
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in .env.local' },
        { status: 500 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);

    const body = await request.json();
    const coins: CoinAnalysisRequest[] = body.coins;
    const portfolioContext: string = body.portfolioContext || '';

    if (!coins || coins.length === 0) {
      return NextResponse.json({ error: 'No coins data provided' }, { status: 400 });
    }

    // Buat cache key berdasarkan data coins dan context
    const cacheKey = `analysis_${JSON.stringify(coins.map(c => ({
      id: c.id,
      price: c.current_price,
      h4: c.h4_change,
      d1: c.price_change_percentage_24h
    })))}_${portfolioContext || 'no-context'}`;

    // Cek apakah hasil sudah ada di cache
    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult && (Date.now() - cachedResult.timestamp < CACHE_DURATION_MS)) {
      console.log('Returning cached AI analysis result');
      return NextResponse.json(cachedResult.data);
    }

    // Gunakan satu unit kuota karena kita akan memanggil API
    consumeQuota();

    // Prepare concise market data summary for AI (optimized for token usage)
    const marketDataSummary = coins.map(coin => {
      const prices = coin.sparkline_in_7d.price;
      const high7d = Math.max(...prices);
      const low7d = Math.min(...prices);
      const avg7d = prices.reduce((a, b) => a + b, 0) / prices.length;
      const volatility = ((high7d - low7d) / avg7d * 100).toFixed(1); // Reduced decimal places

      // Calculate trend direction from sparkline (simplified)
      const recentPrices = prices.slice(-12); // Use fewer data points to reduce tokens
      const olderPrices = prices.slice(-24, -12);
      const recentAvg = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
      const olderAvg = olderPrices.length > 0 ? olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length : recentAvg;
      const shortTermTrend = recentAvg > olderAvg ? 'BULLISH' : 'BEARISH';

      // Concise format to minimize token usage
      return `${coin.symbol}: $${coin.current_price.toFixed(2)} | H4: ${coin.h4_change.toFixed(2)}% | D1: ${coin.price_change_percentage_24h.toFixed(2)}% | 7D Vol: ${volatility}% | Trend: ${shortTermTrend}`;
    }).join('\n');

    const prompt = `
Expert crypto swing trader. Analyze and give BUY/SELL/HOLD with targets.

MARKET DATA:
${marketDataSummary}

${portfolioContext ? `PORTFOLIO: ${portfolioContext.substring(0, 200)}` : ''} // Limit portfolio context length

Provide JSON:
{
  "analysis": [
    {
      "coinId": "id",
      "coinName": "Name",
      "symbol": "SYM",
      "recommendation": "BUY/SELL/HOLD",
      "confidence": 0-100,
      "entryPrice": number,
      "targetPrice": number,
      "stopLoss": number,
      "timeframe": "duration",
      "reasoning": "brief reason",
      "riskLevel": "LOW/MED/HIGH",
      "keyLevels": {"support": [prices], "resistance": [prices]}
    }
  ],
  "marketSentiment": "BULL/BEAR/NEUTRAL",
  "overallAdvice": "concise advice"
}

Rules:
- Use provided data only
- Realistic price targets based on current prices
- Include risk management
- Return ONLY JSON, no other text
`;

    // Use gemini-2.5-pro for enhanced analysis capabilities
    // Note: If you're experiencing issues with model availability,
    // you may need to check your API key permissions or region availability
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192, // Increased token limit for more detailed analysis
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonText = text.split('```')[1].split('```')[0].trim();
    }

    const analysisResult = JSON.parse(jsonText);

    // Simpan hasil ke cache
    analysisCache.set(cacheKey, {
      data: analysisResult,
      timestamp: Date.now()
    });

    return NextResponse.json(analysisResult);
  } catch (error: unknown) {
    console.error('AI Analysis Error:', error);

    // Jika terjadi kesalahan API, kembalikan kuota
    if (dailyQuotaUsed > 0) {
      dailyQuotaUsed--;
    }
    if (minuteQuotaUsed > 0) {
      minuteQuotaUsed--;
    }
    console.log(`Quota refunded due to error: ${dailyQuotaUsed}/${DAILY_QUOTA_LIMIT} (daily), ${minuteQuotaUsed}/${MINUTE_QUOTA_LIMIT} (minute)`);

    // Better error messages
    let errorMessage = 'Failed to generate analysis';
    let errorDetails = String(error);

    if (error instanceof Error) {
      errorDetails = error.message;

      if (error.message.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid Gemini API Key. Please check your .env.local file.';
      } else if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('429')) {
        errorMessage = 'API quota exceeded. Please try again later.';
        // Kembalikan kuota jika API mengembalikan error kuota
        if (dailyQuotaUsed > 0) {
          dailyQuotaUsed--;
        }
        if (minuteQuotaUsed > 0) {
          minuteQuotaUsed--;
        }
      } else if (error.message.includes('model')) {
        errorMessage = 'Model not available. Trying fallback...';
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}

