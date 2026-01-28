import { NextRequest } from 'next/server';

// Endpoint untuk memeriksa apakah Discord webhook telah dikonfigurasi
export async function GET(request: NextRequest) {
  try {
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    return new Response(JSON.stringify({ 
      webhookConfigured: !!discordWebhookUrl
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error checking webhook configuration:', error);
    return new Response(JSON.stringify({ error: 'Failed to check configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}