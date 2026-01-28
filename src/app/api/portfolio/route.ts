import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'portfolio.json');

// Interface untuk data portofolio
interface Holding {
  id: string; // Coin ID (e.g., 'bitcoin')
  amount: number;
  avgBuyPrice: number;
}

interface PortfolioData {
  usdtBalance: number;
  holdings: Holding[];
}

// Helper untuk membaca DB
async function getPortfolio(): Promise<PortfolioData> {
  console.log(`[Portfolio API] Attempting to read portfolio from: ${DB_PATH}`);
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    console.log(`[Portfolio API] Successfully read portfolio. USDT Balance: $${parsed.usdtBalance}`);
    return parsed;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`[Portfolio API] portfolio.json not found. Initializing default data...`);
      const defaultData: PortfolioData = { 
        usdtBalance: 1000, // Memberikan saldo awal agar tidak $0
        holdings: [] 
      };
      // Manually trigger save to create the file
      try {
        const dir = path.dirname(DB_PATH);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
        console.log(`[Portfolio API] Created default portfolio.json at ${DB_PATH}`);
        return defaultData;
      } catch (saveErr) {
        console.error(`[Portfolio API] Failed to auto-initialize file:`, saveErr);
        return defaultData;
      }
    }
    console.error(`[Portfolio API] Error reading portfolio:`, error);
    return { usdtBalance: 0, holdings: [] };
  }
}

// Helper untuk menulis DB
async function savePortfolio(data: PortfolioData) {
  console.log(`[Portfolio API] Attempting to save portfolio to: ${DB_PATH}`);
  try {
    // Ensure directory exists
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[Portfolio API] Successfully saved portfolio. USDT Balance: $${data.usdtBalance}`);
  } catch (error) {
    console.error(`[Portfolio API] Error saving portfolio:`, error);
    throw error;
  }
}

export async function GET() {
  console.log('[Portfolio API] GET request received');
  const data = await getPortfolio();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(`[Portfolio API] POST request received. Action: ${body.action}`);
    
    const currentData = await getPortfolio();

    let newData = { ...currentData };

    if (body.action === 'update_balance') {
        newData.usdtBalance = body.usdtBalance;
        console.log(`[Portfolio API] Updating balance to: $${body.usdtBalance}`);
    }
    else if (body.action === 'add_holding') {
        const { id, amount, avgBuyPrice } = body.holding;
        console.log(`[Portfolio API] Adding/Updating holding: ${id}, Amount: ${amount}`);
        const existingIndex = newData.holdings.findIndex((h: Holding) => h.id === id);

        if (existingIndex >= 0) {
            newData.holdings[existingIndex] = { id, amount, avgBuyPrice };
        } else {
            newData.holdings.push({ id, amount, avgBuyPrice });
        }
    }
    else if (body.action === 'remove_holding') {
        console.log(`[Portfolio API] Removing holding: ${body.id}`);
        newData.holdings = newData.holdings.filter((h: Holding) => h.id !== body.id);
    }

    await savePortfolio(newData);
    return NextResponse.json(newData);
  } catch (error) {
    console.error(`[Portfolio API] POST handler error:`, error);
    return NextResponse.json({ error: 'Failed to process portfolio update' }, { status: 500 });
  }
}

// New endpoint to get portfolio context for AI analysis
export async function PUT(request: Request) {
  console.log('[Portfolio API] PUT request received (Strategy Context)');
  try {
    const currentData = await getPortfolio();

    const portfolioContext = {
      usdtBalance: currentData.usdtBalance,
      totalHoldings: currentData.holdings.length,
      totalValueUSD: 0,
      holdings: currentData.holdings,
      cashPercentage: 0,
      diversification: currentData.holdings.length > 0 ?
        Math.min(100, Math.floor(100 / currentData.holdings.length)) : 100
    };

    const contextString = `Portfolio: USDT Balance: $${currentData.usdtBalance.toFixed(2)}, Holdings Count: ${currentData.holdings.length}, Target Diversification: ${portfolioContext.diversification}% per coin.`;

    return NextResponse.json({
      context: contextString,
      details: portfolioContext
    });
  } catch (error) {
    console.error(`[Portfolio API] PUT handler error:`, error);
    return NextResponse.json({ error: 'Failed to generate portfolio context' }, { status: 500 });
  }
}

