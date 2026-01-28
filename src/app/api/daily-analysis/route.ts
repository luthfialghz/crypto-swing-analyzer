import { NextRequest } from 'next/server';
import { getTargetCoins } from '@/config/target-coins';

// Endpoint untuk mendapatkan data analisis harian
export async function GET(request: NextRequest) {
  try {
    // Dapatkan target coins yang aktif
    const targetCoins = getTargetCoins();
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

    // Format data untuk dikirim ke WhatsApp
    const formattedData = processedData.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      h4_change: coin.h4_change,
      image: coin.image,
    }));

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching daily analysis:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch daily analysis' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}