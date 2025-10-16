import {
  Client,
  IAccount,
  IOperationData,
  IProvider,
  ProviderType,
  IClientConfig,
} from '@massalabs/massa-web3';

export class MassaWeb3Adapter {
  private client: Client | null = null;
  private account: IAccount | null = null;

  async connect(): Promise<boolean> {
    try {
      if (typeof window.massa !== 'undefined') {
        await window.massa.request({ method: 'wallet_enable' });

        const accounts = await window.massa.request({
          method: 'wallet_getAccounts',
        });

        if (accounts && accounts.length > 0) {
          this.account = accounts[0];
          const providers: IProvider[] = [
            { url: 'https://test.massa.net/api/v2', type: ProviderType.PUBLIC },
          ];
          const clientConfig: IClientConfig = {
            providers,
            retryStrategyOn: true,
            periodOffset: 10,
          };
          this.client = new Client(clientConfig);

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
    functionName: string,
    parameter: string,
    coins: string = '0',
  ): Promise<IOperationData> {
    if (!this.client || !this.account) {
      throw new Error('Wallet not connected');
    }

    return await this.client.smartContracts().callSmartContract({
      targetAddress: target,
      functionName: functionName,
      parameter: parameter,
      coins: BigInt(coins),
      fee: BigInt(10000000), // 0.01 MASSA
    });
  }

  async readContract(
    target: string,
    functionName: string,
    parameter: string = '',
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    const result = await this.client.smartContracts().readSmartContract({
      targetAddress: target,
      targetFunction: functionName,
      parameter: parameter,
    });
    
    // The result from readSmartContract is an array of bytes, so we need to decode it.
    // This is a basic example; you might need a more sophisticated deserializer
    // depending on the return type of your contract function.
    return new TextDecoder().decode(new Uint8Array(result.returnValue));
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.client) throw new Error('Client not initialized');

    const balance = await this.client.wallet().getAccountBalance(
      address || this.account?.address || '',
    );

    return balance?.final?.toString() || '0';
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