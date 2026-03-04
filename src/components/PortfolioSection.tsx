'use client';

import { useState } from 'react';
import { ProcessedCoinData } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Plus, Save } from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { CryptoCard } from './CryptoCard';

interface PortfolioSectionProps {
  marketData: ProcessedCoinData[];
  idrRate: number;
}

export const PortfolioSection = ({ marketData, idrRate }: PortfolioSectionProps) => {
  const { usdtBalance, holdings, updateBalance, addHolding, removeHolding } = usePortfolio();
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(usdtBalance.toString());

  // Form State
  const [selectedCoin, setSelectedCoin] = useState(marketData[0]?.id || 'bitcoin');
  const [amountInput, setAmountInput] = useState('');
  const [priceInput, setPriceInput] = useState('');

  // Actions
  const handleUpdateBalance = async () => {
    const newBalance = parseFloat(tempBalance);
    if (isNaN(newBalance)) return;

    await fetch('/api/portfolio', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_balance', usdtBalance: newBalance }),
    });
    updateBalance(newBalance);
    setIsEditingBalance(false);
  };

  const handleAddHolding = async () => {
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
        addHolding({ id: selectedCoin, amount, avgBuyPrice: price });
        setAmountInput('');
        setPriceInput('');
    }
  };

  const handleRemoveHolding = async (id: string) => {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        body: JSON.stringify({ action: 'remove_holding', id }),
      });
      if (res.ok) {
          removeHolding(id);
      }
  };


  return (
    <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black flex items-center gap-3 text-white tracking-tight">
          <div className="p-2 rounded-xl bg-accent-green/10">
            <Wallet size={24} className="text-accent-green" />
          </div>
          My Holdings
        </h2>
        <a
          href="#"
          className="text-xs font-bold uppercase tracking-widest text-accent-blue hover:text-white transition-colors"
        >
          View All Tracks
        </a>
      </div>

      <div className="space-y-4 mb-10">
        {holdings.length === 0 ? (
          <div className="glass p-12 text-center text-text-secondary italic rounded-[2rem]">
            No active holdings in your vault.
          </div>
        ) : (
          holdings.map(holding => {
            const coin = marketData.find(c => c.id === holding.id);
            if (!coin) return null;

            return (
              <CryptoCard
                key={coin.id}
                coin={coin}
                holding={{ amount: holding.amount, avgBuyPrice: holding.avgBuyPrice }}
              />
            );
          })
        )}
      </div>

      {/* Input Forms Section */}
      <div className="glass rounded-[2rem] p-8 space-y-8 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-blue/5 rounded-full blur-3xl group-hover:bg-accent-blue/10 transition-all duration-700"></div>

          <h2 className="text-xl font-bold flex items-center gap-3 text-white relative z-10">
              <div className="p-2 rounded-xl bg-accent-blue/10">
                <Plus size={20} className="text-accent-blue"/>
              </div>
              Manage Portfolio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            {/* USDT Balance Card */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Available USDT</span>
                    {isEditingBalance ? (
                          <button onClick={handleUpdateBalance} className="p-2 bg-accent-green/20 text-accent-green rounded-xl hover:bg-accent-green/30 transition-all active:scale-90"><Save size={18}/></button>
                    ) : (
                          <button onClick={() => { setTempBalance(usdtBalance.toString()); setIsEditingBalance(true); }} className="text-xs font-black uppercase tracking-widest text-accent-blue hover:text-white transition-colors">Adjust</button>
                    )}
                </div>
                {isEditingBalance ? (
                    <input
                        type="number"
                        value={tempBalance}
                        onChange={e => setTempBalance(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xl focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    />
                ) : (
                    <div className="text-3xl font-mono font-black text-white tracking-tighter">
                        {formatCurrency(usdtBalance)}
                    </div>
                )}
            </div>

            {/* Add Holding Form */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                    <Plus size={18} className="text-accent-blue"/> Add New Position
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-2">Select Market</label>
                        <select
                            value={selectedCoin}
                            onChange={e => setSelectedCoin(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue appearance-none cursor-pointer"
                        >
                            {marketData.map(coin => (
                                <option key={coin.id} value={coin.id} className="bg-dark-card">
                                    {coin.name} ({coin.symbol})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-2">Quantity</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amountInput}
                                onChange={e => setAmountInput(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-2">Avg Price</label>
                            <input
                                type="number"
                                placeholder="$0.00"
                                value={priceInput}
                                onChange={e => setPriceInput(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAddHolding}
                        className="w-full py-4 bg-accent-blue shadow-lg shadow-accent-blue/20 hover:brightness-110 text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    >
                        Confirm Position
                    </button>
                </div>
            </div>
          </div>
      </div>
    </section>
  );
};
