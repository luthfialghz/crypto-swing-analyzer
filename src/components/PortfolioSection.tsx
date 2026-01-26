'use client';

import { useState, useEffect } from 'react';
import { ProcessedCoinData } from '@/types'; // Import tipe dari file types anda
import { formatCurrency } from '@/lib/utils';
import { Wallet, Plus, Trash2, Save, RefreshCw } from 'lucide-react';

const IDR_RATE = 16200; // Fallback only

interface Holding {
  id: string;
  amount: number;
  avgBuyPrice: number;
}

interface PortfolioData {
  usdtBalance: number;
  holdings: Holding[];
}

interface PortfolioSectionProps {
  marketData: ProcessedCoinData[];
  idrRate: number;
}

export const PortfolioSection = ({ marketData, idrRate }: PortfolioSectionProps) => {
  const [portfolio, setPortfolio] = useState<PortfolioData>({ usdtBalance: 0, holdings: [] });
  const [loading, setLoading] = useState(true);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState('0');

  // Form State
  const [selectedCoin, setSelectedCoin] = useState(marketData[0]?.id || 'bitcoin');
  const [amountInput, setAmountInput] = useState('');
  const [priceInput, setPriceInput] = useState('');

  // Fetch initial data
  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
        setTempBalance(data.usdtBalance.toString());
      }
    } catch (error) {
      console.error("Failed to fetch portfolio", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Actions
  const updateBalance = async () => {
    const newBalance = parseFloat(tempBalance);
    if (isNaN(newBalance)) return;

    await fetch('/api/portfolio', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_balance', usdtBalance: newBalance }),
    });
    setPortfolio(prev => ({ ...prev, usdtBalance: newBalance }));
    setIsEditingBalance(false);
  };

  const addHolding = async () => {
    const amount = parseFloat(amountInput);
    const price = parseFloat(priceInput);
    if (!amount || !price) return;

    const res = await fetch('/api/portfolio', {
      method: 'POST',
      body: JSON.stringify({
        action: 'add_holding',
        holding: { id: selectedCoin, amount, avgBuyPrice: price }
      }),
    });

    if (res.ok) {
        const newData = await res.json();
        setPortfolio(newData);
        setAmountInput('');
        setPriceInput('');
    }
  };

  const removeHolding = async (id: string) => {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        body: JSON.stringify({ action: 'remove_holding', id }),
      });
      if (res.ok) {
          const newData = await res.json();
          setPortfolio(newData);
      }
  };

  // Calculations
  const calculateTotalValue = () => {
    let total = portfolio.usdtBalance; // Cash
    portfolio.holdings.forEach(h => {
        const coin = marketData.find(c => c.id === h.id);
        if (coin) {
            total += h.amount * coin.current_price;
        }
    });
    return total;
  };

  const totalPortfolioValue = calculateTotalValue();

  return (
    <section className="mt-12 rounded-3xl border border-slate-700/50 bg-slate-900/40 p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
          <Wallet className="text-indigo-400" />
          My Portfolio
        </h2>
        
        <div className="text-right">
             <p className="text-slate-400 text-sm">Total Valuation</p>
             <p className="text-3xl font-bold text-white font-mono tracking-tight">
                {formatCurrency(totalPortfolioValue)}
             </p>
             <p className="text-emerald-400 text-sm font-mono">
                ≈ Rp {(totalPortfolioValue * idrRate).toLocaleString('id-ID')}
             </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Forms */}
        <div className="space-y-6">
            {/* USDT Balance Card */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/30">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-300 font-medium">USDT Balance</span>
                    {isEditingBalance ? (
                         <button onClick={updateBalance} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"><Save size={16}/></button>
                    ) : (
                         <button onClick={() => setIsEditingBalance(true)} className="text-xs text-sky-400 hover:text-sky-300">Edit</button>
                    )}
                </div>
                {isEditingBalance ? (
                    <input 
                        type="number" 
                        value={tempBalance} 
                        onChange={e => setTempBalance(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                ) : (
                    <div className="text-2xl font-mono font-bold text-white">
                        {formatCurrency(portfolio.usdtBalance)}
                    </div>
                )}
            </div>

            {/* Add Holding Form */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/30">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-sky-400"/> Add Transaction
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Select Coin</label>
                        <select 
                            value={selectedCoin} 
                            onChange={e => setSelectedCoin(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white appearance-none focus:outline-none focus:border-sky-500"
                        >
                            {marketData.map(coin => (
                                <option key={coin.id} value={coin.id}>
                                    {coin.name} ({coin.symbol}) - ${coin.current_price.toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Amount</label>
                            <input 
                                type="number" 
                                placeholder="0.00"
                                value={amountInput}
                                onChange={e => setAmountInput(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Buy Price ($)</label>
                            <input 
                                type="number" 
                                placeholder="Avg Price"
                                value={priceInput}
                                onChange={e => setPriceInput(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={addHolding}
                        className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition"
                    >
                        Save Transaction
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column: Holdings List Table */}
        <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-800/20">
                <table className="w-full">
                    <thead className="bg-slate-800/80 text-xs text-slate-400 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-left font-medium">Asset</th>
                            <th className="px-6 py-4 text-right font-medium">Holdings</th>
                            <th className="px-6 py-4 text-right font-medium">Avg Buy</th>
                            <th className="px-6 py-4 text-right font-medium">Current Val</th>
                            <th className="px-6 py-4 text-right font-medium">PnL (USD)</th>
                            <th className="px-6 py-4 text-center font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {portfolio.holdings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">
                                    No assets found. Start adding your crypto!
                                </td>
                            </tr>
                        ) : (
                            portfolio.holdings.map(holding => {
                                const coin = marketData.find(c => c.id === holding.id);
                                if (!coin) return null; // Or skeleton

                                const currentVal = holding.amount * coin.current_price;
                                const initialVal = holding.amount * holding.avgBuyPrice;
                                const pnl = currentVal - initialVal;
                                const pnlPercent = (pnl / initialVal) * 100;
                                const isProfit = pnl >= 0;

                                return (
                                    <tr key={holding.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={coin.image} alt={coin.symbol} className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <div className="font-bold text-white">{coin.symbol}</div>
                                                    <div className="text-xs text-slate-500">{coin.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-white font-mono">{holding.amount}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-slate-400 font-mono text-xs">
                                                ${holding.avgBuyPrice.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-white font-mono font-medium">
                                                {formatCurrency(currentVal)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`font-mono font-bold text-sm ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {formatCurrency(pnl)}
                                            </div>
                                            <div className={`text-xs ${isProfit ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                                                {pnlPercent.toFixed(2)}%
                                                <span className="ml-1 opacity-75">
                                                    (Rp {Math.abs(pnl * idrRate).toLocaleString('id-ID')})
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => removeHolding(holding.id)}
                                                className="text-slate-500 hover:text-rose-500 transition"
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </section>
  );
};
