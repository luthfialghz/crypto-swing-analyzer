import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PORTFOLIO_PATH = path.join(process.cwd(), 'data', 'portfolio.json');

// Metadata map: CoinGecko ID → display name & symbol
const COIN_METADATA: Record<string, { name: string; symbol: string }> = {
  'bitcoin': { name: 'Bitcoin', symbol: 'BTC' },
  'ethereum': { name: 'Ethereum', symbol: 'ETH' },
  'solana': { name: 'Solana', symbol: 'SOL' },
  'bittensor': { name: 'Bittensor', symbol: 'TAO' },
  'chaingpt': { name: 'ChainGPT', symbol: 'CGPT' },
  'near': { name: 'NEAR Protocol', symbol: 'NEAR' },
  'render-token': { name: 'Render Token', symbol: 'RNDR' },
  'tether': { name: 'Tether', symbol: 'USDT' },
  'binancecoin': { name: 'BNB', symbol: 'BNB' },
  'ripple': { name: 'XRP', symbol: 'XRP' },
  'cardano': { name: 'Cardano', symbol: 'ADA' },
  'dogecoin': { name: 'Dogecoin', symbol: 'DOGE' },
  'litecoin': { name: 'Litecoin', symbol: 'LTC' },
  'chainlink': { name: 'Chainlink', symbol: 'LINK' },
  'polkadot': { name: 'Polkadot', symbol: 'DOT' },
  'avalanche-2': { name: 'Avalanche', symbol: 'AVAX' },
  'matic-network': { name: 'Polygon', symbol: 'MATIC' },
};

async function getPortfolioHoldings() {
  try {
    const data = await fs.readFile(PORTFOLIO_PATH, 'utf-8');
    const portfolio = JSON.parse(data);
    return portfolio.holdings || [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const holdings = await getPortfolioHoldings();

    const targetCoins = holdings.map((h: { id: string; amount: number; avgBuyPrice: number }) => {
      const meta = COIN_METADATA[h.id] ?? { name: h.id, symbol: h.id.toUpperCase() };
      return {
        id: h.id,
        name: meta.name,
        symbol: meta.symbol,
        enabled: true,
        createdAt: new Date().toISOString(),
      };
    });

    return NextResponse.json(targetCoins);
  } catch (error) {
    console.error('Error deriving target coins from portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch target coins' }, { status: 500 });
  }
}
