import { Client, IAccount, IEvent, IOperation } from '@massalabs/massa-web3';

export class MassaWeb3Adapter {
  private client: Client | null = null;
  private account: IAccount | null = null;

  async connect(): Promise<boolean> {
    try {
      if (typeof window.massa !== 'undefined') {
        await window.massa.request({ method: 'wallet_enable' });
        
        const accounts = await window.massa.request({ 
          method: 'wallet_getAccounts' 
        });
        
        if (accounts && accounts.length > 0) {
          this.account = accounts[0];
          this.client = new Client({
            providers: [{ url: 'https://test.massa.net/api/v2' }],
            retryStrategyOn: true,
            periodOffset: 10
          });
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }

  async callContract(
    target: string,
    function: string,
    parameter: string,
    coins: string = '0'
  ): Promise<IOperation> {
    if (!this.client || !this.account) {
      throw new Error('Wallet not connected');
    }

    return await this.client.smartContracts().callSmartContract({
      targetAddress: target,
      functionName: function,
      parameter: parameter,
      coins: BigInt(coins),
      fee: BigInt(10000000) // 0.01 MASSA
    });
  }

  async readContract(
    target: string,
    function: string,
    parameter: string = ''
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    const result = await this.client.smartContracts().readSmartContract({
      targetAddress: target,
      targetFunction: function,
      parameter: parameter
    });

    return result.returnValue;
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.client) throw new Error('Client not initialized');
    
    const balance = await this.client.wallet().getAccountBalance(
      address || this.account?.address || ''
    );
    
    return balance?.finalBalance?.toString() || '0';
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (typeof window.massa !== 'undefined') {
      window.massa.on('accountsChanged', callback);
    }
  }

  onDisconnect(callback: () => void): void {
    if (typeof window.massa !== 'undefined') {
      window.massa.on('disconnect', callback);
    }
  }
}

// Global declaration for Massa Station
declare global {
  interface Window {
    massa?: any;
  }
}

export const massaWeb3 = new MassaWeb3Adapter();