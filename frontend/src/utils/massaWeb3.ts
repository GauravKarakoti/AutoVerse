import {
  Args,
  Client,
  IProvider,
  ProviderType,
  ReadSCData,
  MAX_GAS_EXECUTE,
} from '@massalabs/massa-web3';
import {
  getWallets,
  Wallet,
  IAccount as WalletAccount,
} from '@massalabs/wallet-provider';

export class MassaWeb3Adapter {
  private wallet: Wallet | null = null;
  private account: WalletAccount | null = null;
  private client: Client | null = null;

  async connect(): Promise<boolean> {
    try {
      const wallets = await getWallets();
      const massaStation = wallets.find(
        (wallet) => wallet.name() === 'MassaStation',
      );

      if (massaStation) {
        this.wallet = massaStation;
        if (!this.wallet.connected()) {
          await this.wallet.connect();
        }
        const accounts = await this.wallet.accounts();
        if (accounts.length > 0) {
          this.account = accounts[0];
          const providers: IProvider[] = [
            { url: 'https://test.massa.net/api/v2', type: ProviderType.PUBLIC },
          ];
          this.client = new Client({
            providers,
            retryStrategyOn: true,
            periodOffset: 10,
          }, this.account);
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
  ): Promise<string> {
    if (!this.client || !this.account) {
      throw new Error('Wallet not connected');
    }

    const op = await this.client.smartContracts().callSmartContract({
      targetAddress: target,
      functionName: functionName,
      parameter: new Args().addString(parameter).serialize(),
      coins: BigInt(coins),
      fee: 0n,
      maxGas: MAX_GAS_EXECUTE,
    });

    return op.operationId;
  }

  async readContract(
    target: string,
    functionName: string,
    parameter: string = '',
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    const result: ReadSCData = await this.client.smartContracts().readSmartContract({
      targetAddress: target,
      targetFunction: functionName,
      parameter: new Args().addString(parameter).serialize(),
      maxGas: MAX_GAS_EXECUTE,
    });

    return new TextDecoder().decode(new Uint8Array(result.returnValue));
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.client) throw new Error('Client not initialized');
    const addr = address || this.account?.address();
    if (!addr) return '0';

    const balance = await this.client.wallet().getAccountBalance(addr);
    return balance?.final.toString() || '0';
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    this.wallet?.listenAccountChanges({
      onAccountChanged: (address: string) => callback(address ? [address] : []),
    });
  }

  onDisconnect(callback: () => void): void {
    // This is a placeholder as wallet-provider does not have a generic 'disconnect' event.
    console.warn('onDisconnect is not fully supported by the current provider.');
  }
}

// Global declaration for Massa Station
declare global {
  interface Window {
    massa?: any;
  }
}

export const massaWeb3 = new MassaWeb3Adapter();