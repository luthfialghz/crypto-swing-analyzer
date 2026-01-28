import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Cache untuk menyimpan hasil analisis AI
// Format: { [cacheKey: string]: { data: any, timestamp: number } }
const analysisCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 menit cache

// Maximum cache size to prevent memory issues
const MAX_CACHE_SIZE = 100;

// Sistem pelacakan kuota harian dan per menit
let dailyQuotaUsed = 0;
let minuteQuotaUsed = 0;
const DAILY_QUOTA_LIMIT = 1000; // Batas RPD untuk Gemini 2.5 Flash Free Tier
const MINUTE_QUOTA_LIMIT = 15; // Batas per menit untuk Free Tier (dikurangi agar tetap dalam batas)
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

// Fungsi untuk membersihkan cache yang kadaluarsa
function cleanupExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of analysisCache.entries()) {
    if (now - value.timestamp >= CACHE_DURATION_MS) {
      analysisCache.delete(key);
    }
  }

  // Also limit cache size to prevent memory issues
  if (analysisCache.size > MAX_CACHE_SIZE) {
    // Remove oldest entries
    const entries = Array.from(analysisCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    while (analysisCache.size > MAX_CACHE_SIZE) {
      const [oldestKey] = entries.shift()!;
      analysisCache.delete(oldestKey);
    }
  }
}

// Fungsi untuk membuat cache key yang lebih efisien
function generateCacheKey(coins: CoinAnalysisRequest[], portfolioContext: string): string {
  // Create a hash-like key based on coin IDs and prices
  const coinSignature = coins.map(c =>
    `${c.id}-${Math.round(c.current_price * 100)}-${Math.round(c.h4_change * 100)}-${Math.round(c.price_change_percentage_24h * 100)}`
  ).join('|');

  const contextSignature = portfolioContext ?
    `ctx-${portfolioContext.substring(0, 50).replace(/\W+/g, '')}` : 'no-ctx';

  return `${coinSignature}|${contextSignature}`;
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

    // Get portfolio context from the portfolio API if not provided in the request
    let portfolioContext: string = body.portfolioContext || '';
    if (!portfolioContext) {
      try {
        const portfolioRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/portfolio`, {
          method: 'GET'
        });
        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          portfolioContext = portfolioData.context;
        }
      } catch (err) {
        console.warn('Could not fetch portfolio context:', err);
        // Continue without portfolio context
      }
    }

    if (!coins || coins.length === 0) {
      return NextResponse.json({ error: 'No coins data provided' }, { status: 400 });
    }

    // Bersihkan cache yang kadaluarsa sebelum memproses permintaan baru
    cleanupExpiredCache();

    // Buat cache key berdasarkan data coins dan context
    const cacheKey = generateCacheKey(coins, portfolioContext);

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

    // Fetch target coins configuration to provide context for alternative investment suggestions
    let availableCoins = [];
    try {
      const targetCoinsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/target-coins`);
      if (targetCoinsRes.ok) {
        const targetCoins = await targetCoinsRes.json();
        availableCoins = targetCoins.filter((coin: any) => coin.enabled);
      }
    } catch (err) {
      console.warn('Could not fetch target coins configuration for alternative suggestions:', err);
      // Fallback to default coins if API fails
      availableCoins = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
        { id: 'solana', name: 'Solana', symbol: 'SOL' },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
        { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' }
      ];
    }

    const alternativeCoinsList = availableCoins
      .filter((coin: any) => !coins.some(c => c.id === coin.id))
      .map((coin: any) => `${coin.symbol} (${coin.name})`)
      .slice(0, 10) // Limit to 10 alternatives to save tokens
      .join(', ');

    const prompt = `
Seorang ahli trading swing crypto. ANALISIS UNTUK SWING TRADING (BUKAN SCALPING) dengan timeframe 4H-7D.

DATA PASAR:
${marketDataSummary}

${portfolioContext ? `KONTEKS PORTOFOLIO: ${portfolioContext.substring(0, 300)}` : ''} // Sertakan konteks portofolio untuk ukuran posisi

KOIN YANG TERSEDIA UNTUK INVESTASI ALTERNATIF: ${alternativeCoinsList || 'bitcoin, ethereum, solana, cardano, polkadot'} // Sarankan ini saat merekomendasikan penjualan

Berikan JSON:
{
  "analysis": [
    {
      "coinId": "id",
      "coinName": "Nama",
      "symbol": "SIM",
      "recommendation": "BELI/JUAL/TAHAN",
      "confidence": 0-100,
      "positionSizePercent": 0-100, // Persentase dari saldo USDT untuk dialokasikan
      "entryPrice": number,
      "targetPrice": number,
      "stopLoss": number,
      "timeframe": "durasi swing (misalnya, 2-7 hari)",
      "reasoning": "Rasio trading SWING dengan analisis tren",
      "riskLevel": "RENDAH/SEDANG/TINGGI",
      "keyLevels": {"support": [harga], "resistance": [harga]},
      "swingPlan": {
        "strategy": "strategi swing spesifik",
        "entry": "kapan dan bagaimana masuk",
        "exit": "kapan dan bagaimana keluar",
        "riskManagement": "kontrol risiko untuk trading swing"
      }
    }
  ],
  "marketSentiment": "BULLISH/BEARISH/NETRAL",
  "overallAdvice": "saran trading swing komprehensif dengan mempertimbangkan alokasi portofolio"
}

Aturan:
- FOKUS PADA SWING TRADING (tahan posisi selama beberapa jam hingga hari, BUKAN menit)
- Sertakan ukuran posisi berdasarkan konteks portofolio (jika disediakan)
- Rekomendasikan KOIN ALTERNATIF dari daftar KOIN YANG TERSEDIA saat merekomendasikan PENJUALAN kepemilikan saat ini
- Pertimbangkan rebalancing portofolio: jika merekomendasikan untuk JUAL, sarankan apa yang harus dibeli dengan hasil penjualan dari daftar koin yang tersedia
- Target harga realistis berdasarkan level teknikal dan chart 4H/1D
- Sertakan manajemen risiko dengan stop loss
- Faktor diversifikasi portofolio
- Kembalikan HANYA JSON VALID, tanpa teks lain
- Jika konteks portofolio mencakup saldo USDT, rekomendasikan persentase alokasi spesifik
- Untuk situasi CUT LOSS, rekomendasikan investasi alternatif dari daftar koin yang tersedia
- Untuk rekomendasi BELI, pertimbangkan koin mana yang mungkin dikurangi posisinya untuk membiayai pembelian
`;

    // Use gemini-2.5-flash for better free tier availability
    // Gemini 2.5 Pro has had its free tier significantly restricted
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192, // Increased token limit for more detailed analysis
      }
    });

    // Try to generate content with the model
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (apiError: any) {
      // Handle specific API errors
      if (apiError.status === 429 || apiError.message?.includes('quota') || apiError.message?.includes('429')) {
        console.error('API quota exceeded for this request');

        // Return a more informative error with retry suggestion
        return NextResponse.json(
          {
            error: 'API quota exceeded. Please try again later.',
            quotaInfo: {
              used: dailyQuotaUsed,
              limit: DAILY_QUOTA_LIMIT,
              minuteUsed: minuteQuotaUsed,
              minuteLimit: MINUTE_QUOTA_LIMIT,
              resetAfter: Math.ceil((MINUTE_RESET_TIME - (Date.now() - lastMinuteReset)) / 1000),
              retryAfter: Math.ceil((MINUTE_RESET_TIME - (Date.now() - lastMinuteReset)) / 1000) + 5 // Add buffer
            }
          },
          { status: 429 }
        );
      }

      // Re-throw other errors to be handled by the outer catch
      throw apiError;
    }

    const response = await result.response;
    const text = response.text();

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonText = text.split('```')[1].split('```')[0].trim();
    }

    // Clean up the JSON string to handle common issues
    jsonText = jsonText
      .replace(/^\s*```json\s*/, '')  // Remove leading ```json
      .replace(/\s*```\s*$/, '')      // Remove trailing ```
      .trim();

    // Attempt to fix common JSON issues
    let parsedJson;
    try {
      // Try parsing as-is first
      parsedJson = JSON.parse(jsonText);
      // Validate the structure
      if (!parsedJson.analysis || !Array.isArray(parsedJson.analysis)) {
        throw new Error('Invalid analysis result structure');
      }
      if (!parsedJson.marketSentiment || !parsedJson.overallAdvice) {
        throw new Error('Missing required fields in analysis result');
      }
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON using regex
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      } else {
        throw new Error(`Could not extract valid JSON from response: ${jsonText.substring(0, 200)}...`);
      }

      // Try parsing again
      parsedJson = JSON.parse(jsonText);

      // Validate the structure again
      if (!parsedJson.analysis || !Array.isArray(parsedJson.analysis)) {
        throw new Error('Invalid analysis result structure after extraction');
      }
      if (!parsedJson.marketSentiment || !parsedJson.overallAdvice) {
        throw new Error('Missing required fields in analysis result after extraction');
      }
    }

    const analysisResult = parsedJson;

    // Simpan hasil ke cache
    analysisCache.set(cacheKey, {
      data: analysisResult,
      timestamp: Date.now()
    });

    return NextResponse.json(analysisResult);
  } catch (error: unknown) {
    console.error('AI Analysis Error:', JSON.stringify(error, null, 2));

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
    let statusCode = 500;

    if (error instanceof Error) {
      errorDetails = error.message;

      if (error.message.includes('API_KEY_INVALID')) {
        errorMessage = 'Invalid Gemini API Key. Please check your .env.local file.';
      } else if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('429')) {
        errorMessage = 'API quota exceeded. Please try again later.';
        statusCode = 429;
        // Kembalikan kuota jika API mengembalikan error kuota
        if (dailyQuotaUsed > 0) {
          dailyQuotaUsed--;
        }
        if (minuteQuotaUsed > 0) {
          minuteQuotaUsed--;
        }
      } else if (error.message.includes('model')) {
        errorMessage = 'Model not available. Please check if your API key has access to the requested model.';
      } else if (error.message.includes('500') || error.message.includes('Internal')) {
        errorMessage = 'Internal server error from AI service. Please try again later.';
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        quotaInfo: {
          used: dailyQuotaUsed,
          limit: DAILY_QUOTA_LIMIT,
          minuteUsed: minuteQuotaUsed,
          minuteLimit: MINUTE_QUOTA_LIMIT
        }
      },
      { status: statusCode }
    );
  }
}

