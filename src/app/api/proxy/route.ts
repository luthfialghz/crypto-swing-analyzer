import { NextResponse } from 'next/server';

const CACHE_DURATION_MS = 60 * 1000; // 60 seconds
const cache = new Map<string, { data: any; timestamp: number }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const params = searchParams.get('params');

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
  }

  const BASE_URL = 'https://api.coingecko.com/api/v3';
  const targetUrl = `${BASE_URL}/${endpoint}?${params || ''}`;
  
  // Check Cache
  const cacheKey = targetUrl;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && (now - cached.timestamp < CACHE_DURATION_MS)) {
      // Return cached data
      return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'CryptoSwingAnalyzer/1.0',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
        // If rate limited, return cached data if available (even if expired)
        if (res.status === 429 && cached) {
             return NextResponse.json(cached.data);
        }
        return NextResponse.json({ error: `CoinGecko API Error: ${res.statusText}` }, { status: res.status });
    }

    const data = await res.json();
    
    // Save to Cache
    cache.set(cacheKey, { data, timestamp: now });
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
