export type Address = string;

export enum VaultStatus {
  ACTIVE = 0,
  PAUSED = 1,
  COMPLETED = 2,
  INSUFFICIENT_BALANCE = 3
}

export class VaultConfig {
  constructor(
    public owner: Address,
    public baseToken: Address,
    public targetToken: Address,
    public interval: u32, // in hours
    public amount: u64,
    public autoCompound: boolean = true
  ) {}
}

export class VaultData {
  constructor(
    public config: VaultConfig,
    public nextExecution: u64,
    public totalExecutions: u32,
    public status: VaultStatus,
    public createdAt: u64
  ) {}
}

export class SwapResult {
  constructor(
    public success: boolean,
    public amountIn: u64,
    public amountOut: u64,
    public timestamp: u64
  ) {}
}