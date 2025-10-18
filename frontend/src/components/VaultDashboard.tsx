import React from 'react';
import { VaultData } from '../types';

interface VaultDashboardProps {
  vaults: VaultData[];
  onRefresh: () => void;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({ 
  vaults, 
  onRefresh 
}) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your DCA Vaults</h2>
        <button
          onClick={onRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {vaults.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active vaults. Create your first DCA strategy!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vaults.map((vault) => (
            <div key={vault.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {vault.config.baseToken} → {vault.config.targetToken}
                  </h3>
                  <p className="text-sm text-gray-600">Every {vault.config.interval}h</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vault.status)}`}>
                  {vault.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{vault.config.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Executions:</span>
                  <span className="font-medium">{vault.totalExecutions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Execution:</span>
                  <span className="font-medium">{formatTime(vault.nextExecution)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto-compound:</span>
                  <span className="font-medium">
                    {vault.config.autoCompound ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {vault.status === 'ACTIVE' && (
                <button className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
                  Cancel Vault
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};