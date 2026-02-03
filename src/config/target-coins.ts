// Configuration for target coins with persistent JSON database
import fs from 'fs/promises';
import path from 'path';

export interface TargetCoin {
  id: string; // CoinGecko ID
  name: string; // Display name
  symbol: string; // Trading symbol
  enabled: boolean; // Whether this coin is actively tracked
  createdAt: string; // ISO string format
}

const DB_PATH = path.join(process.cwd(), 'data', 'target-coins.json');

// Default target coins - used for initialization only
const DEFAULT_TARGET_COINS: TargetCoin[] = [
  {
    id: 'chaingpt',
    name: 'ChainGPT',
    symbol: 'CGPT',
    enabled: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'bittensor',
    name: 'Bittensor',
    symbol: 'TAO',
    enabled: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'near',
    name: 'NEAR Protocol',
    symbol: 'NEAR',
    enabled: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'render-token',
    name: 'Render Token',
    symbol: 'RNDR',
    enabled: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'tether',
    name: 'Tether',
    symbol: 'USDT',
    enabled: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
];

/**
 * Read target coins from database file
 */
async function readDatabase(): Promise<TargetCoin[]> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log('[Target Coins] Database file not found. Creating with default coins...');
      await writeDatabase(DEFAULT_TARGET_COINS);
      return DEFAULT_TARGET_COINS;
    }
    console.error('[Target Coins] Error reading database:', error);
    return DEFAULT_TARGET_COINS;
  }
}

/**
 * Write target coins to database file
 */
async function writeDatabase(coins: TargetCoin[]): Promise<void> {
  try {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(coins, null, 2), 'utf-8');
    console.log('[Target Coins] Database saved successfully');
  } catch (error) {
    console.error('[Target Coins] Error writing database:', error);
    throw error;
  }
}

/**
 * Get all active target coins
 */
export const getTargetCoins = async (): Promise<TargetCoin[]> => {
  const coins = await readDatabase();
  return coins.filter(coin => coin.enabled);
};

/**
 * Get all target coins (including disabled ones)
 */
export const getAllTargetCoins = async (): Promise<TargetCoin[]> => {
  return await readDatabase();
};

/**
 * Add a new target coin
 */
export const addTargetCoin = async (coin: Omit<TargetCoin, 'createdAt' | 'enabled'>): Promise<TargetCoin> => {
  const coins = await readDatabase();
  const existingCoin = coins.find(c => c.id === coin.id);

  if (existingCoin) {
    // If coin already exists, just enable it
    existingCoin.enabled = true;
    await writeDatabase(coins);
    return existingCoin;
  }

  const newCoin: TargetCoin = {
    ...coin,
    enabled: true,
    createdAt: new Date().toISOString(),
  };

  coins.push(newCoin);
  await writeDatabase(coins);
  return newCoin;
};

/**
 * Remove a target coin (disable it)
 */
export const removeTargetCoin = async (id: string): Promise<boolean> => {
  const coins = await readDatabase();
  const index = coins.findIndex(coin => coin.id === id);
  
  if (index !== -1) {
    coins[index].enabled = false;
    await writeDatabase(coins);
    return true;
  }
  return false;
};

/**
 * Toggle a coin's enabled status
 */
export const toggleTargetCoin = async (id: string): Promise<boolean> => {
  const coins = await readDatabase();
  const coin = coins.find(coin => coin.id === id);
  
  if (coin) {
    coin.enabled = !coin.enabled;
    await writeDatabase(coins);
    return coin.enabled;
  }
  return false;
};

/**
 * Find a target coin by ID
 */
export const findTargetCoin = async (id: string): Promise<TargetCoin | undefined> => {
  const coins = await readDatabase();
  return coins.find(coin => coin.id === id);
};

/**
 * Initialize target coins from API data (for when API is implemented)
 */
export const initializeTargetCoins = async (coins: TargetCoin[]): Promise<void> => {
  await writeDatabase(coins);
};