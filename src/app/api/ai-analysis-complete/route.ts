import { NextRequest } from 'next/server';
import { getTargetCoins } from '@/config/target-coins';

// Endpoint untuk mendapatkan hasil lengkap dari AI Swing Analysis
export async function GET(request: NextRequest) {
  try {
    // Dapatkan target coins yang aktif
    const targetCoins = await getTargetCoins();
    const ids = targetCoins.map(coin => coin.id).join(',');

    if (!ids) {
      return new Response(JSON.stringify({ error: 'No target coins configured' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ambil data pasar dari CoinGecko melalui proxy
    const marketsParams = `vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;
    const proxyUrl = `${request.nextUrl.origin}/api/proxy?endpoint=coins/markets&params=${encodeURIComponent(marketsParams)}`;

    const coinsRes = await fetch(proxyUrl);

    if (!coinsRes.ok) {
      throw new Error('API Error loading coins');
    }

    const result = await coinsRes.json();

    // Proses data untuk menghitung perubahan H4
    const processedData = targetCoins.map(targetCoin => {
      const item: any = result.find((coin: any) => coin.id === targetCoin.id);
      if (!item) return null;

      // Hitung perubahan H4
      const sparkline = item.sparkline_in_7d.price;
      let h4_change = 0;
      if (sparkline && sparkline.length >= 5) {
        const current = sparkline[sparkline.length - 1];
        const prev = sparkline[sparkline.length - 5];
        if (prev !== 0) {
          h4_change = ((current - prev) / prev) * 100;
        }
      }

      return {
        ...item,
        h4_change,
      };
    }).filter((item: any) => item !== null);

    // Simulasikan analisis AI (dalam implementasi nyata, ini akan diproses oleh model AI)
    const aiAnalysis = processedData.map((coin: any) => {
      // Logika sederhana untuk simulasi rekomendasi AI
      let recommendation = 'TAHAN'; // Default
      let confidence = Math.floor(Math.random() * 30) + 70; // Antara 70-99%
      
      // Jika perubahan H4 positif tinggi, rekomendasikan BELI
      if (coin.h4_change > 5) {
        recommendation = 'BELI';
        confidence = Math.min(99, Math.floor(coin.h4_change * 3)); // Skala kepercayaan berdasarkan perubahan
      } 
      // Jika perubahan H4 negatif tinggi, rekomendasikan JUAL
      else if (coin.h4_change < -5) {
        recommendation = 'JUAL';
        confidence = Math.min(99, Math.floor(Math.abs(coin.h4_change) * 3)); // Skala kepercayaan berdasarkan perubahan
      }
      
      // Generate rekomendasi koin alternatif (simulasi)
      const alternativeCoins = processedData
        .filter((c: any) => c.id !== coin.id)
        .sort((a: any, b: any) => b.h4_change - a.h4_change)
        .slice(0, 3) // Ambil 3 koin terbaik
        .map((altCoin: any) => ({
          id: altCoin.id,
          name: altCoin.name,
          symbol: altCoin.symbol.toUpperCase(),
          current_price: altCoin.current_price,
          price_change_percentage_24h: altCoin.price_change_percentage_24h,
          h4_change: altCoin.h4_change,
          image: altCoin.image,
          reasoning: `Menunjukkan tren positif dengan perubahan H4 ${altCoin.h4_change.toFixed(2)}%`
        }));

      return {
        coinId: coin.id,
        coinName: coin.name,
        symbol: coin.symbol.toUpperCase(),
        recommendation,
        confidence,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        h4_change: coin.h4_change,
        image: coin.image,
        alternativeCoins: recommendation === 'JUAL' ? alternativeCoins : [],
        reasoning: getReasoning(recommendation, coin),
        riskLevel: getRiskLevel(coin.h4_change)
      };
    });

    // Simulasikan overall market sentiment
    const overallSentiment = processedData.reduce((acc, coin: any) => acc + coin.h4_change, 0) / processedData.length;
    const marketSentiment = overallSentiment > 1 ? 'BULLISH' : overallSentiment < -1 ? 'BEARISH' : 'NEUTRAL';
    
    const overallAdvice = getOverallAdvice(marketSentiment, processedData);

    return new Response(JSON.stringify({ 
      analysis: aiAnalysis,
      marketSentiment,
      overallAdvice
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching AI analysis:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch AI analysis' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Fungsi bantu untuk menghasilkan alasan
function getReasoning(recommendation: string, coin: any) {
  switch (recommendation) {
    case 'BELI':
      return `Koin menunjukkan tren positif dengan perubahan H4 sebesar ${coin.h4_change.toFixed(2)}%. Peluang beli yang baik.`;
    case 'JUAL':
      return `Koin menunjukkan tren negatif dengan perubahan H4 sebesar ${coin.h4_change.toFixed(2)}%. Disarankan untuk menjual.`;
    default:
      return `Koin menunjukkan stabilitas dengan perubahan H4 sebesar ${coin.h4_change.toFixed(2)}%. Disarankan untuk menahan posisi.`;
  }
}

// Fungsi bantu untuk menentukan tingkat risiko
function getRiskLevel(h4_change: number) {
  if (Math.abs(h4_change) > 10) return 'TINGGI';
  if (Math.abs(h4_change) > 5) return 'SEDANG';
  return 'RENDAH';
}

// Fungsi bantu untuk saran pasar keseluruhan
function getOverallAdvice(sentiment: string, data: any[]) {
  if (sentiment === 'BULLISH') {
    return `Pasar sedang **bullish**. Mayoritas koin (${Math.round((data.filter((c: any) => c.h4_change > 0).length/data.length)*100)}%) menunjukkan tren positif. Cocok untuk strategi *buy on dips*.`;
  } else if (sentiment === 'BEARISH') {
    return `Pasar sedang **bearish**. Mayoritas koin (${Math.round((data.filter((c: any) => c.h4_change < 0).length/data.length)*100)}%) menunjukkan tren negatif. Disarankan untuk bersikap hati-hati dan pertimbangkan *profit taking*.`;
  } else {
    return `Pasar sedang **netral**. Tidak ada tren dominan. Disarankan untuk mengikuti strategi *range trading* dan waspada terhadap pergerakan mendadak.`;
  }
}