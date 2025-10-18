import { useState, useEffect, useCallback } from 'react';
import { VaultData, VaultConfig } from '../types';
import { massaWeb3 } from '../utils/massaWeb3';
// IOperationData is removed from here

const CONTRACT_ADDRESS = 'AS1266zNf6AGQs8LFskr7dsa85pRLQTPw26sm732yqDSDeZQZHsEN';

export const useVaults = () => {
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserVaults = useCallback(async () => {
    if (!massaWeb3) return;

    try {
      setLoading(true);
      setError(null);

      // Get user address (simplified)
      const userVaults = await massaWeb3.readContract(
        CONTRACT_ADDRESS,
        'getUserVaults',
        '' // User address would be parameter in production
      );
      console.log('Fetched user vaults:', userVaults);

      // Parse and fetch individual vault data
      const vaultIds = userVaults.split(',').filter(id => id.length > 0);
      const vaultsData: VaultData[] = [];
      console.log('Vault IDs to fetch:', vaultIds);

      for (const vaultId of vaultIds) {
        const vaultInfo = await massaWeb3.readContract(
          CONTRACT_ADDRESS,
          'getVaultInfo',
          vaultId
        );
        console.log(`Vault info for ID ${vaultId}:`, vaultInfo);

        if (vaultInfo) {
          const parts = vaultInfo.split(',');
          vaultsData.push({
            id: vaultId,
            config: {
              baseToken: parts[1],
              targetToken: parts[2],
              interval: parseInt(parts[3]),
              amount: parts[4],
              autoCompound: parts[5] === '1'
            },
            nextExecution: parseInt(parts[6]),
            totalExecutions: parseInt(parts[7]),
            status: ['ACTIVE', 'PAUSED', 'COMPLETED', 'INSUFFICIENT_BALANCE'][parseInt(parts[8])] as any,
            createdAt: parseInt(parts[9])
          });
          console.log(`Parsed vault data for ID ${vaultId}:`, vaultsData[vaultsData.length - 1]);
        }
      }

      setVaults(vaultsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vaults');
    } finally {
      setLoading(false);
    }
  }, []);

  const createVault = useCallback(async (config: VaultConfig): Promise<string> => { // Return a string
    try {
      setLoading(true);
      setError(null);

      const parameter = `${config.baseToken},${config.targetToken},${config.interval},${config.amount},${config.autoCompound ? 1 : 0}`;

      const result = await massaWeb3.callContract(
        CONTRACT_ADDRESS,
        'createVault',
        parameter,
        '100000000' // 0.1 MASSA for deployment
      );
      console.log('Vault creation operation ID:', result);

      // Refresh vaults list
      await fetchUserVaults();

      return result; // Return the operation ID string
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create vault';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchUserVaults]);

  const cancelVault = useCallback(async (vaultId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await massaWeb3.callContract(
        CONTRACT_ADDRESS,
        'cancelVault',
        vaultId
      );

      await fetchUserVaults();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel vault';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchUserVaults]);

  useEffect(() => {
    fetchUserVaults();
  }, [fetchUserVaults]);

  return {
    vaults,
    loading,
    error,
    createVault,
    cancelVault,
    refreshVaults: fetchUserVaults
  };
};