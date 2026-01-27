// Configuration for target coins
// This serves as the interface for the API endpoint that manages target coins

export interface TargetCoin {
  id: string; // CoinGecko ID
  name: string; // Display name
  symbol: string; // Trading symbol
  enabled: boolean; // Whether this coin is actively tracked
  createdAt: string; // ISO string format
}

// Default target coins - these can be modified dynamically
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

// In-memory storage for target coins (will be replaced with database in production)
let targetCoins: TargetCoin[] = [...DEFAULT_TARGET_COINS];

/**
 * Get all active target coins
 */
export const getTargetCoins = (): TargetCoin[] => {
  return targetCoins.filter(coin => coin.enabled);
};

/**
 * Get all target coins (including disabled ones)
 */
export const getAllTargetCoins = (): TargetCoin[] => {
  return [...targetCoins];
};

/**
 * Add a new target coin
 */
export const addTargetCoin = (coin: Omit<TargetCoin, 'createdAt' | 'enabled'>): TargetCoin => {
  const existingCoin = targetCoins.find(c => c.id === coin.id);

  if (existingCoin) {
    // If coin already exists, just enable it
    existingCoin.enabled = true;
    return existingCoin;
  }

  const newCoin: TargetCoin = {
    ...coin,
    enabled: true,
    createdAt: new Date().toISOString(),
  };

  targetCoins.push(newCoin);
  return newCoin;
};

/**
 * Remove a target coin (disable it)
 */
export const removeTargetCoin = (id: string): boolean => {
  const index = targetCoins.findIndex(coin => coin.id === id);
  if (index !== -1) {
    targetCoins[index].enabled = false;
    return true;
  }
  return false;
};

/**
 * Toggle a coin's enabled status
 */
export const toggleTargetCoin = (id: string): boolean => {
  const coin = targetCoins.find(coin => coin.id === id);
  if (coin) {
    coin.enabled = !coin.enabled;
    return coin.enabled;
  }
  return false;
};

/**
 * Find a target coin by ID
 */
export const findTargetCoin = (id: string): TargetCoin | undefined => {
  return targetCoins.find(coin => coin.id === id);
};

/**
 * Initialize target coins from API data (for when API is implemented)
 */
export const initializeTargetCoins = (coins: TargetCoin[]) => {
  targetCoins = coins;
};