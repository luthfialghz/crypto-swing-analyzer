'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, CheckCircle, XCircle, Database } from 'lucide-react';

interface TargetCoin {
  id: string;
  name: string;
  symbol: string;
  enabled: boolean;
  createdAt: string; // ISO string format
}

interface TargetCoinsManagerProps {
  onCoinsChange?: () => void; // Callback when coins are modified
}

export const TargetCoinsManager = ({ onCoinsChange }: TargetCoinsManagerProps) => {
  const [coins, setCoins] = useState<TargetCoin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCoinId, setNewCoinId] = useState('');
  const [newCoinName, setNewCoinName] = useState('');
  const [newCoinSymbol, setNewCoinSymbol] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load coins on mount and when changes occur
  useEffect(() => {
    loadCoins();
  }, []);

  const loadCoins = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/target-coins');
      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects if needed
        setCoins(data.map((coin: any) => ({
          ...coin,
          createdAt: typeof coin.createdAt === 'string' ? coin.createdAt : new Date(coin.createdAt).toISOString()
        })));
      } else {
        setError('Failed to load target coins');
      }
    } catch (err) {
      setError('Error loading target coins');
      console.error('Error loading target coins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoin = async () => {
    if (!newCoinId.trim() || !newCoinName.trim() || !newCoinSymbol.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await fetch('/api/target-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newCoinId.trim(),
          name: newCoinName.trim(),
          symbol: newCoinSymbol.trim().toUpperCase(),
        }),
      });

      if (response.ok) {
        setNewCoinId('');
        setNewCoinName('');
        setNewCoinSymbol('');
        setShowForm(false);
        setError('');
        loadCoins(); // Reload coins after successful addition

        if (onCoinsChange) {
          onCoinsChange();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add coin');
      }
    } catch (err) {
      setError('Failed to add coin. Please check if the coin ID is valid.');
    }
  };

  const handleRemoveCoin = async (id: string) => {
    if (!window.confirm(`Are you sure you want to remove ${id}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/target-coins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        loadCoins(); // Reload coins after successful removal
        if (onCoinsChange) {
          onCoinsChange();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to remove coin');
      }
    } catch (err) {
      setError('Error removing coin');
    }
  };

  const handleToggleCoin = async (id: string) => {
    try {
      const response = await fetch('/api/target-coins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        loadCoins(); // Reload coins after successful toggle
        if (onCoinsChange) {
          onCoinsChange();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to toggle coin');
      }
    } catch (err) {
      setError('Error toggling coin');
    }
  };

  const filteredCoins = coins.filter(coin =>
    coin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="glass rounded-[2rem] p-12">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-blue"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Syncing Markets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-[2rem] p-8 overflow-hidden relative group">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-4 text-white tracking-tight">
            <div className="p-2.5 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
              <Database size={24} className="text-accent-blue" />
            </div>
            Target Markets
          </h2>
          <p className="text-text-secondary text-xs font-medium mt-2">
            Configure automated tracking for specific crypto assets
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            showForm 
              ? 'bg-white/5 text-white hover:bg-white/10' 
              : 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20 hover:brightness-110'
          }`}
        >
          {showForm ? <XCircle size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
          {showForm ? 'Cancel Operation' : 'Register Market'}
        </button>
      </div>

      {/* Add Coin Form */}
      {showForm && (
        <div className="mb-10 p-8 rounded-[1.5rem] bg-white/5 border border-white/5 animate-fade-in">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">New Market Protocol</h3>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">CoinGecko ID</label>
              <input
                type="text"
                value={newCoinId}
                onChange={(e) => setNewCoinId(e.target.value)}
                placeholder="e.g., bitcoin"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">Display Name</label>
              <input
                type="text"
                value={newCoinName}
                onChange={(e) => setNewCoinName(e.target.value)}
                placeholder="e.g., Bitcoin"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">Symbol</label>
              <input
                type="text"
                value={newCoinSymbol}
                onChange={(e) => setNewCoinSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., BTC"
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAddCoin}
              className="px-8 py-3 rounded-xl bg-accent-green text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
            >
              Initialize Node
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-8 relative group/search">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-text-secondary group-focus-within/search:text-white transition-colors" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter protocols..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/20 border border-white/5 text-white placeholder-text-secondary/50 focus:outline-none focus:border-white/10 transition-all font-medium text-sm"
        />
      </div>

      {/* Coins List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-text-secondary">Status</th>
              <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-text-secondary">Identifier</th>
              <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-text-secondary">Network Name</th>
              <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest text-text-secondary">Symbol</th>
              <th className="py-4 px-4 text-right text-[10px] font-black uppercase tracking-widest text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCoins.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 px-4 text-center text-text-secondary text-xs italic font-medium">
                  {searchTerm ? 'No protocols match search' : 'No target markets initialized'}
                </td>
              </tr>
            ) : (
              filteredCoins.map((coin) => (
                <tr key={coin.id} className="group/row hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 px-4">
                    <button
                      onClick={() => handleToggleCoin(coin.id)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                        coin.enabled ? 'text-accent-green' : 'text-accent-red opacity-60 hover:opacity-100'
                      }`}
                    >
                      {coin.enabled ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      <span>{coin.enabled ? 'Online' : 'Offline'}</span>
                    </button>
                  </td>
                  <td className="py-5 px-4 font-mono text-xs text-text-secondary group-hover/row:text-white transition-colors">{coin.id}</td>
                  <td className="py-5 px-4 text-sm font-bold text-white">{coin.name}</td>
                  <td className="py-5 px-4">
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
                      {coin.symbol}
                    </span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <button
                      onClick={() => handleRemoveCoin(coin.id)}
                      className="p-2 rounded-xl bg-accent-red/10 text-accent-red hover:bg-accent-red hover:text-white transition-all opacity-0 group-hover/row:opacity-100"
                      title="Decommission node"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-10 p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/10">
        <p className="text-[10px] font-bold text-accent-blue uppercase tracking-widest flex items-center gap-2">
          <CheckCircle size={12} /> Root Node Advisory
        </p>
        <p className="text-[10px] text-text-secondary mt-1 font-medium">Use official CoinGecko API IDs for data integrity. Analysis only executes on Online nodes.</p>
      </div>
    </div>
  );
};