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
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Jika file tidak ada, return default
    return { usdtBalance: 0, holdings: [] };
  }
}

// Helper untuk menulis DB
async function savePortfolio(data: PortfolioData) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const data = await getPortfolio();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentData = await getPortfolio();
    
    // Update data (Merge logic sederhana)
    // Body bisa berisi { usdtBalance: ... } atau { holding: ... }
    
    let newData = { ...currentData };

    if (body.action === 'update_balance') {
        newData.usdtBalance = body.usdtBalance;
    } 
    else if (body.action === 'add_holding') {
        const { id, amount, avgBuyPrice } = body.holding;
        // Cek jika coin sudah ada, update average (simplified: replace or add logic)
        // Disini kita akan simple add/replace
        const existingIndex = newData.holdings.findIndex((h: Holding) => h.id === id);
        
        if (existingIndex >= 0) {
            // Update existing
            newData.holdings[existingIndex] = { id, amount, avgBuyPrice };
        } else {
            // New holding
            newData.holdings.push({ id, amount, avgBuyPrice });
        }
    }
    else if (body.action === 'remove_holding') {
        newData.holdings = newData.holdings.filter((h: Holding) => h.id !== body.id);
    }

    await savePortfolio(newData);
    return NextResponse.json(newData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
