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

export async function GET(request: NextRequest) {
  try {
    const coins = await getAllTargetCoins();
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
    const { id, name, symbol } = await request.json();

    if (!id || !name || !symbol) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, symbol' },
        { status: 400 }
      );
    }

    const newCoin = await addTargetCoin({ id, name, symbol });
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
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing coin id' },
        { status: 400 }
      );
    }

    const coin = await findTargetCoin(id);
    if (!coin) {
      return NextResponse.json(
        { error: 'Coin not found' },
        { status: 404 }
      );
    }

    const isEnabled = await toggleTargetCoin(id);
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
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing coin id' },
        { status: 400 }
      );
    }

    const success = await removeTargetCoin(id);
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