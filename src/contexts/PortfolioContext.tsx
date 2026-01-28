'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ProcessedCoinData, CoinAnalysis } from '@/types';

interface PortfolioItem {
  id: string;
  amount: number;
  avgBuyPrice: number;
}

interface PortfolioState {
  usdtBalance: number;
  holdings: PortfolioItem[];
  addHolding: (holding: PortfolioItem) => void;
  removeHolding: (id: string) => void;
  updateBalance: (balance: number) => void;
}

const PortfolioContext = createContext<PortfolioState | undefined>(undefined);

export const PortfolioProvider = ({ children, initialData }: { children: ReactNode, initialData?: any }) => {
  const [usdtBalance, setUsdtBalance] = useState(initialData?.usdtBalance || 0);
  const [holdings, setHoldings] = useState<PortfolioItem[]>(initialData?.holdings || []);

  // Load portfolio from API on mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch('/api/portfolio');
        if (res.ok) {
          const data = await res.json();
          setUsdtBalance(data.usdtBalance);
          setHoldings(data.holdings);
        }
      } catch (error) {
        console.error("Failed to fetch portfolio", error);
      }
    };

    fetchPortfolio();
  }, []);

  const addHolding = (holding: PortfolioItem) => {
    setHoldings(prev => {
      const existingIndex = prev.findIndex(h => h.id === holding.id);
      if (existingIndex >= 0) {
        // Update existing holding
        const updated = [...prev];
        updated[existingIndex] = holding;
        return updated;
      } else {
        // Add new holding
        return [...prev, holding];
      }
    });
  };

  const removeHolding = (id: string) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
  };

  const updateBalance = (balance: number) => {
    setUsdtBalance(balance);
  };

  return (
    <PortfolioContext.Provider
      value={{
        usdtBalance,
        holdings,
        addHolding,
        removeHolding,
        updateBalance
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};