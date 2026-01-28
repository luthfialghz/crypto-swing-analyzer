import { NextRequest } from 'next/server';

// Endpoint untuk mengirim notifikasi ke Discord webhook
export async function POST(request: NextRequest) {
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

    // Dapatkan data dari body
    const body = await request.json();
    const { message } = body;

    // Validasi input
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Format payload untuk Discord webhook dengan embed
    const discordPayload = {
      username: "Crypto Swing Analyzer",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/3527/3527620.png", // Icon kripto
      embeds: [{
        title: "🔔 TEST NOTIFIKASI AI SWING ANALYSIS",
        description: message,
        color: 5814783, // Warna biru kehijauan (dalam desimal)
        timestamp: new Date().toISOString(),
        footer: {
          text: "Crypto Swing Analyzer | Sistem Notifikasi",
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
      message: 'Discord notification sent successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send Discord notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}