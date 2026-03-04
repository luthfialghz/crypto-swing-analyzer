'use client';

import { useState, useCallback, useEffect } from 'react';
import { CoinData, ProcessedCoinData } from '@/types';

export const useCryptoData = () => {
  const [data, setData] = useState<ProcessedCoinData[]>([]);
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE' | 'IDLE'>('IDLE');
  const [lastUpdated, setLastUpdated] = useState<string>('-');
  const [isLoading, setIsLoading] = useState(true);
  const [idrRate, setIdrRate] = useState(16200); // Default fallback
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      // Fetch target coins from API
      const targetCoinsRes = await fetch('/api/target-coins');
      if (!targetCoinsRes.ok) throw new Error('Failed to load target coins configuration');

      const targetCoins = await targetCoinsRes.json();
      const activeCoins = targetCoins.filter((coin: any) => coin.enabled);
      const ids = activeCoins.map((coin: any) => coin.id).join(',');

      if (!ids) {
        setData([]);
        setStatus('ONLINE');
        setLastUpdated(new Date().toLocaleTimeString());
        return;
      }

      // Request via Proxy
      const marketsParams = `vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;
      const priceParams = `ids=tether&vs_currencies=idr`;

      // Parallel Fetch ke Local Proxy
      const fetchCoins = fetch(`/api/proxy?endpoint=coins/markets&params=${encodeURIComponent(marketsParams)}`);
      const fetchRate = fetch(`/api/proxy?endpoint=simple/price&params=${encodeURIComponent(priceParams)}`);

      const [coinsRes, rateRes] = await Promise.all([fetchCoins, fetchRate]);

      if (!coinsRes.ok) throw new Error('API Error loading coins');

      const result: CoinData[] = await coinsRes.json();

      // Parse IDR Rate (Safe parsing)
      if (rateRes.ok) {
          try {
            const rateData = await rateRes.json();
            if (rateData.tether?.idr) {
                setIdrRate(rateData.tether.idr);
            }
          } catch(e) { /* Ignore rate parse error */ }
      }

      const processed: ProcessedCoinData[] = activeCoins.map((targetCoin: any) => {
        const item = result.find((coin: any) => coin.id === targetCoin.id);
        if (!item) return null;

        // Calculate H4 Change
        const sparkline = item.sparkline_in_7d.price;
        let h4_change = 0;
        if (sparkline && sparkline.length >= 5) {
          const current = sparkline[sparkline.length - 1];
          const prev = sparkline[sparkline.length - 5];
          if (prev !== 0) {
            h4_change = ((current - prev) / prev) * 100;
          }
        }

        return {
          ...item,
          h4_change,
        };
      }).filter((item: ProcessedCoinData | null): item is ProcessedCoinData => item !== null);

      setData(processed);
      setStatus('ONLINE');
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Fetch failed', error);
      setStatus('OFFLINE');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount and auto-refresh every 60 seconds
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Manual refresh function - called by user action
  const refresh = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  return { data, status, lastUpdated, isLoading, idrRate, isRefreshing, refresh };
};
