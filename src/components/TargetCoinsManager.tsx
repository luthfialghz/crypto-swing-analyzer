'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

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
      <div className="rounded-3xl border border-slate-700/50 bg-slate-900/40 p-8 backdrop-blur-xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-700/50 bg-slate-900/40 p-8 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
            <span className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Search size={24} />
            </span>
            Target Coins Manager
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage which cryptocurrencies to track and analyze
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 shadow-blue-500/25"
        >
          <Plus size={18} className="mr-2" />
          {showForm ? 'Cancel' : 'Add Coin'}
        </button>
      </div>

      {/* Add Coin Form */}
      {showForm && (
        <div className="mb-8 p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30">
          <h3 className="text-lg font-semibold text-white mb-4">Add New Target Coin</h3>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">CoinGecko ID *</label>
              <input
                type="text"
                value={newCoinId}
                onChange={(e) => setNewCoinId(e.target.value)}
                placeholder="e.g., bitcoin, ethereum"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Find on CoinGecko API</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Display Name *</label>
              <input
                type="text"
                value={newCoinName}
                onChange={(e) => setNewCoinName(e.target.value)}
                placeholder="e.g., Bitcoin"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Symbol *</label>
              <input
                type="text"
                value={newCoinSymbol}
                onChange={(e) => setNewCoinSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., BTC"
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddCoin}
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
            >
              Add Coin
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search coins by ID, name, or symbol..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Coins List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-700/50">
            <tr>
              <th className="py-3 px-4 text-left text-slate-400 font-medium">Status</th>
              <th className="py-3 px-4 text-left text-slate-400 font-medium">Coin ID</th>
              <th className="py-3 px-4 text-left text-slate-400 font-medium">Name</th>
              <th className="py-3 px-4 text-left text-slate-400 font-medium">Symbol</th>
              <th className="py-3 px-4 text-left text-slate-400 font-medium">Added</th>
              <th className="py-3 px-4 text-right text-slate-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoins.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-slate-500">
                  {searchTerm ? 'No coins match your search' : 'No target coins configured'}
                </td>
              </tr>
            ) : (
              filteredCoins.map((coin) => (
                <tr key={coin.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleCoin(coin.id)}
                      className={`flex items-center gap-2 ${coin.enabled ? 'text-emerald-400' : 'text-rose-400'}`}
                    >
                      {coin.enabled ? <CheckCircle size={18} /> : <XCircle size={18} />}
                      <span>{coin.enabled ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-300">{coin.id}</td>
                  <td className="py-4 px-4 text-white">{coin.name}</td>
                  <td className="py-4 px-4 font-bold text-white">{coin.symbol}</td>
                  <td className="py-4 px-4 text-slate-400">{new Date(coin.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleRemoveCoin(coin.id)}
                      className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors"
                      title="Remove coin"
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

      <div className="mt-6 text-sm text-slate-500">
        <p><strong>Note:</strong> Use CoinGecko API IDs for accurate data retrieval. Active coins will be included in analysis.</p>
      </div>
    </div>
  );
};