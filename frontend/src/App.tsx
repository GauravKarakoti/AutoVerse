import { useState, useEffect } from 'react';
import { VaultCreator } from './components/VaultCreator';
import { VaultDashboard } from './components/VaultDashboard';
import { useVaults } from './hooks/useVaults';
import { massaWeb3 } from './utils/massaWeb3';
import './App.css'

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { vaults, loading, error, createVault, refreshVaults } = useVaults();

  const connectWallet = async () => {
    setConnecting(true);
    try {
      const connected = await massaWeb3.connect();
      setIsConnected(connected);
      
      if (connected) {
        massaWeb3.onAccountsChanged((accounts) => {
          if (accounts.length === 0) {
            setIsConnected(false);
          } else {
            refreshVaults();
          }
        });
        
        massaWeb3.onDisconnect(() => {
          setIsConnected(false);
        });
      }
    } catch (err) {
      console.error('Failed to connect:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleCreateVault = async (config: any) => {
    await createVault(config);
    await refreshVaults();
  };

  useEffect(() => {
    // Try to auto-connect on load
    connectWallet();
  }, []);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Autoverse</h1>
          <p className="text-gray-600 mb-6">Your Self-Operating DeFi Universe</p>
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {connecting ? 'Connecting...' : 'Connect Massa Wallet'}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Connect your Massa Station wallet to start automating your investments
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Autoverse</h1>
          <p className="text-xl text-gray-600">Your Self-Operating DeFi Universe</p>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto">
          <VaultCreator onCreateVault={handleCreateVault} loading={loading} />
          <VaultDashboard vaults={vaults} onRefresh={refreshVaults} />
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500">
          <p>Powered by Massa Autonomous Smart Contracts & DeWeb</p>
        </footer>
      </div>
    </div>
  );
}

export default App;