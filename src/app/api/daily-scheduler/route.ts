import { NextRequest } from 'next/server';

// Endpoint untuk menjalankan tugas harian (akan dipanggil oleh scheduler)
export async function GET(request: NextRequest) {
  try {
    // Ambil Discord webhook URL dari environment variable
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!discordWebhookUrl) {
      return new Response(JSON.stringify({ error: 'Discord webhook URL not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ambil data analisis harian
    const analysisUrl = `${request.nextUrl.origin}/api/ai-analysis-complete`;
    const analysisRes = await fetch(analysisUrl);

    if (!analysisRes.ok) {
      throw new Error('Failed to fetch AI analysis');
    }

    const analysisData = await analysisRes.json();

    // Format pesan untuk Discord
    const currentTime = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Format pesan untuk Discord embed
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

    // Format payload untuk Discord webhook dengan embed
    const message = description;

    // Kirim pesan ke Discord webhook
    const discordRes = await fetch(`${request.nextUrl.origin}/api/send-discord`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message
      })
    });

    if (!discordRes.ok) {
      throw new Error('Failed to send Discord notification');
    }

    const discordResult = await discordRes.json();

    return new Response(JSON.stringify({
      success: true,
      message: 'Daily analysis notification sent successfully to Discord',
      discordResult,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in daily analysis scheduler:', error);
    return new Response(JSON.stringify({ error: 'Failed to run daily analysis scheduler' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}