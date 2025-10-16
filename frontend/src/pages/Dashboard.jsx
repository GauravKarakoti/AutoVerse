import { useVaults } from '../hooks/useVaults';
import VaultCard from '../components/VaultCard';

const Dashboard = () => {
  const { vaults, loading, error } = useVaults();

  if (loading) {
    return (
      <div className="component-container text-center">
        <div className="loading-spinner"></div>
        <p>Loading your vaults...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="component-container">
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="component-container">
      <div className="flex justify-between items-center mb-6">
        <h2>Your DCA Vaults</h2>
        <button className="btn-primary">
          + Create New Vault
        </button>
      </div>
      
      <div className="vaults-grid">
        {vaults.map(vault => (
          <VaultCard key={vault.id} vault={vault} />
        ))}
      </div>

      {vaults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No active vaults found.</p>
          <button className="btn-primary">
            Create Your First Vault
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;