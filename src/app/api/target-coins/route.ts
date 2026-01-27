import { NextRequest, NextResponse } from 'next/server';
import {
  addTargetCoin,
  removeTargetCoin,
  toggleTargetCoin,
  getAllTargetCoins,
  findTargetCoin,
  TargetCoin,
  initializeTargetCoins
} from '@/config/target-coins';

// In-memory storage for target coins (will be replaced with database in production)
// Initialize with default coins
let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    // Load default coins if not already loaded
    initialized = true;
  }
}

export async function GET(request: NextRequest) {
  try {
    ensureInitialized();
    const coins = getAllTargetCoins();
    return NextResponse.json(coins);
  } catch (error) {
    console.error('Error fetching target coins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch target coins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureInitialized();
    const { id, name, symbol } = await request.json();

    if (!id || !name || !symbol) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, symbol' },
        { status: 400 }
      );
    }

    const newCoin = addTargetCoin({ id, name, symbol });
    return NextResponse.json(newCoin);
  } catch (error) {
    console.error('Error adding target coin:', error);
    return NextResponse.json(
      { error: 'Failed to add target coin' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    ensureInitialized();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing coin id' },
        { status: 400 }
      );
    }

    const coin = findTargetCoin(id);
    if (!coin) {
      return NextResponse.json(
        { error: 'Coin not found' },
        { status: 404 }
      );
    }

    const isEnabled = toggleTargetCoin(id);
    return NextResponse.json({ ...coin, enabled: isEnabled });
  } catch (error) {
    console.error('Error toggling target coin:', error);
    return NextResponse.json(
      { error: 'Failed to toggle target coin' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    ensureInitialized();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing coin id' },
        { status: 400 }
      );
    }

    const success = removeTargetCoin(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Coin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing target coin:', error);
    return NextResponse.json(
      { error: 'Failed to remove target coin' },
      { status: 500 }
    );
  }
}