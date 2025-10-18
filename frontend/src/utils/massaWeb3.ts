import {
  Args,
  JsonRpcProvider,
  JsonRpcPublicProvider, // Import JsonRpcPublicProvider
  ReadSCData,
  MAX_GAS_EXECUTE,
} from '@massalabs/massa-web3';
import {
  getWallets,
  Wallet,
  MassaStationAccount,
} from '@massalabs/wallet-provider';

export class MassaWeb3Adapter {
  private wallet: Wallet | null = null;
  private account: MassaStationAccount | null = null;
  private client: JsonRpcPublicProvider | null = null; // Use JsonRpcPublicProvider

  async connect(): Promise<boolean> {
    try {
      const wallets = await getWallets();
      const massaStation = wallets.find(
        (wallet) => (wallet.name() as string) === 'MASSA WALLET',
      );
      console.log('Available wallets:', wallets.map(w => w.name()));

      if (massaStation) {
        this.wallet = massaStation;
        if (!(await this.wallet.connected())) {
          await this.wallet.connect();
          console.log('Wallet connection initiated');
        }
        const accounts = await this.wallet.accounts();
        if (accounts.length > 0) {
          this.account = accounts[0] as MassaStationAccount;
          console.log('Connected account:', this.account.address);
          this.client = await JsonRpcProvider.fromRPCUrl('https://buildnet.massa.net/api/v2');
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
    if (!this.account) {
      throw new Error('Wallet not connected');
    }

    const op = await this.account.callSC({
      target,
      func: functionName,
      parameter: new Args().addString(parameter).serialize(),
      coins: BigInt(coins),
      fee: 0n,
      maxGas: MAX_GAS_EXECUTE,
    });

    return op.id; // Use 'id' instead of 'operationId'
  }

  async readContract(
    target: string,
    functionName: string,
    parameter: string = '',
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    const result: ReadSCData = await this.client.readSC({
      target,
      func: functionName,
      parameter: new Args().addString(parameter).serialize(),
      maxGas: MAX_GAS_EXECUTE,
    });

    return new TextDecoder().decode(new Uint8Array(result.value));
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.client) throw new Error('Client not initialized');
    const addr = address || this.account?.address;
    if (!addr) return '0';

    // Use balanceOf to get the balance
    const balance = await this.client.balanceOf([addr]);
    return balance[0]?.balance.toString() || '0';
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    this.wallet?.listenAccountChanges((address: string) => {
      callback(address ? [address] : []);
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