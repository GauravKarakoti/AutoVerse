export interface VaultConfig {
  baseToken: string;
  targetToken: string;
  interval: number;
  amount: string;
  autoCompound: boolean;
}

export interface VaultData {
  id: string;
  config: VaultConfig;
  nextExecution: number;
  totalExecutions: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'INSUFFICIENT_BALANCE';
  createdAt: number;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  balance: string;
}