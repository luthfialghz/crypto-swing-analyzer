import { NextRequest } from 'next/server';

// Endpoint untuk menguji keseluruhan proses: fetch data -> AI analysis -> send to Discord
export async function GET(request: NextRequest) {
  try {
    // Ambil Discord webhook URL dari environment variables
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!discordWebhookUrl) {
      return new Response(JSON.stringify({ 
        error: 'Discord webhook URL not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Langkah 1: Fetch market data dan proses AI analysis
    const analysisUrl = `${request.nextUrl.origin}/api/ai-analysis-complete`;
    const analysisRes = await fetch(analysisUrl);

    if (!analysisRes.ok) {
      throw new Error('Failed to fetch AI analysis');
    }

    const analysisData = await analysisRes.json();

    // Langkah 2: Format pesan untuk Discord embed
    const currentTime = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let description = `**Tanggal:** ${currentTime}\n\n`;
    
    // Tambahkan sentiment pasar keseluruhan
    description += `**📊 Sentimen Pasar:** ${analysisData.marketSentiment}\n`;
    description += `**💡 Saran:** ${analysisData.overallAdvice}\n\n`;
    
    description += `**📈 Analisis Kripto Hari Ini:**\n\n`;

    // Tambahkan data kripto ke pesan
    analysisData.analysis.forEach((coin: any, index: number) => {
      description += `**${index + 1}. ${coin.coinName} (${coin.symbol})**\n`;
      description += `• 💰 Harga: $${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
      description += `• 🎯 Rekomendasi: ${coin.recommendation} (Kepercayaan: ${coin.confidence}%)\n`;
      description += `• 📈 24h: ${coin.price_change_percentage_24h >= 0 ? '↗️ +' : '↘️ '}${coin.price_change_percentage_24h.toFixed(2)}%\n`;
      description += `• ⏱️ H4: ${coin.h4_change >= 0 ? '↗️ +' : '↘️ '}${coin.h4_change.toFixed(2)}%\n`;
      
      // Tambahkan rekomendasi koin alternatif jika ada
      if (coin.alternativeCoins && coin.alternativeCoins.length > 0) {
        description += `• 🔄 **Koin Alternatif:** `;
        const altSymbols = coin.alternativeCoins.slice(0, 3).map((altCoin: any) => 
          `${altCoin.symbol} (${altCoin.h4_change >= 0 ? '+' : ''}${altCoin.h4_change.toFixed(2)}%)`
        ).join(', ');
        description += `${altSymbols}\n`;
      }
      
      description += `\n`;
    });

    description += `*🔍 Analisis lebih lanjut tersedia di Crypto Swing Analyzer Anda.*`;

    // Langkah 3: Kirim hasil ke Discord webhook
    const discordPayload = {
      username: "Crypto Swing Analyzer",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/3527/3527620.png", // Icon kripto
      embeds: [{
        title: "🔔 [TEST] LAPORAN ANALISIS SWING HARIAN",
        description: description,
        color: 5814783, // Warna biru kehijauan (dalam desimal)
        timestamp: new Date().toISOString(),
        footer: {
          text: "Crypto Swing Analyzer | Proses Otomatis",
          icon_url: "https://cdn-icons-png.flaticon.com/512/3527/3527620.png"
        }
      }]
    };

    // Kirim pesan ke Discord webhook
    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Discord webhook error: ${errorData.message || 'Unknown error'}`);
    }

    // Discord tidak selalu memberikan response JSON, jadi kita tangani dengan hati-hati
    let result;
    try {
      result = await response.json();
    } catch (e) {
      // Jika response tidak dalam format JSON, anggap berhasil
      result = { success: true };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Complete automated process test successful: Fetch Market Data -> AI Analysis -> Send to Discord',
      steps: {
        fetchMarketData: '✅ Success',
        aiAnalysis: '✅ Success',
        sendToDiscord: '✅ Success'
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in complete automated process test:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed complete automated process test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}