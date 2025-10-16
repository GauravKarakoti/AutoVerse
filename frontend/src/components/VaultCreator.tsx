import React, { useState } from 'react';
import { VaultConfig } from '../types';

interface VaultCreatorProps {
  onCreateVault: (config: VaultConfig) => Promise<void>;
  loading?: boolean;
}

const TOKENS = [
  { address: 'AS12USDCtest12345678901234567890', symbol: 'USDC', decimals: 6 },
  { address: 'AS12MASSA1234567890123456789012', symbol: 'MASSA', decimals: 9 },
  { address: 'AS12WETHtest1234567890123456789', symbol: 'WETH', decimals: 18 },
];

const INTERVALS = [
  { value: 6, label: 'Every 6 hours' },
  { value: 12, label: 'Every 12 hours' },
  { value: 24, label: 'Every 24 hours' },
  { value: 168, label: 'Every week' },
];

export const VaultCreator: React.FC<VaultCreatorProps> = ({ 
  onCreateVault, 
  loading = false 
}) => {
  const [config, setConfig] = useState<Partial<VaultConfig>>({
    baseToken: '',
    targetToken: '',
    interval: 24,
    amount: '',
    autoCompound: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.baseToken || !config.targetToken || !config.amount) {
      alert('Please fill in all fields');
      return;
    }

    if (config.baseToken === config.targetToken) {
      alert('Base and target tokens must be different');
      return;
    }

    try {
      await onCreateVault(config as VaultConfig);
      // Reset form
      setConfig({
        baseToken: '',
        targetToken: '',
        interval: 24,
        amount: '',
        autoCompound: true,
      });
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New DCA Vault</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From (Base Token)
            </label>
            <select
              value={config.baseToken}
              onChange={(e) => setConfig({ ...config, baseToken: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select token</option>
              {TOKENS.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Target Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To (Target Token)
            </label>
            <select
              value={config.targetToken}
              onChange={(e) => setConfig({ ...config, targetToken: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select token</option>
              {TOKENS.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interval Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DCA Interval
            </label>
            <select
              value={config.interval}
              onChange={(e) => setConfig({ ...config, interval: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              {INTERVALS.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount per Swap
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={config.amount}
              onChange={(e) => setConfig({ ...config, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Auto-compound Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoCompound"
            checked={config.autoCompound}
            onChange={(e) => setConfig({ ...config, autoCompound: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="autoCompound" className="ml-2 block text-sm text-gray-700">
            Auto-compound received tokens
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Vault...' : 'Create Autonomous DCA Vault'}
        </button>
      </form>
    </div>
  );
};