import { DCAEngine } from "./dcaEngine";
import { VaultStorage } from "./storage";
import { VaultConfig, Address } from "./types";

// Contract entry points
export function createVault(
  baseToken: string,
  targetToken: string,
  interval: u32,
  amount: u64,
  autoCompound: boolean = true
): string {
  const caller = Context.caller().toString();
  const vaultId = `vault_${getCurrentPeriod()}_${caller.slice(-8)}`;

  const config = new VaultConfig(
    caller,
    baseToken,
    targetToken,
    interval,
    amount,
    autoCompound
  );

  DCAEngine.initializeVault(vaultId, config);
  return vaultId;
}

export function executeDCA(vaultId: string): void {
  DCAEngine.executeDCA(vaultId);
}

export function executeBatchDCA(vaultIds: string): void {
  const ids = vaultIds.split(",").filter(id => id.length > 0);
  DCAEngine.executeBatchDCA(ids);
}

export function cancelVault(vaultId: string): boolean {
  const caller = Context.caller().toString();
  return DCAEngine.cancelVault(vaultId, caller);
}

export function getUserVaults(user: string): string[] {
  return VaultStorage.getUserVaults(user);
}

export function getVaultInfo(vaultId: string): string {
  const vault = DCAEngine.getVaultInfo(vaultId);
  if (!vault) return "";

  return `${vault.config.owner},${vault.config.baseToken},${vault.config.targetToken},${vault.config.interval},${vault.config.amount},${vault.config.autoCompound ? 1 : 0},${vault.nextExecution},${vault.totalExecutions},${vault.status},${vault.createdAt}`;
}

export function initialize(): void {
  // Contract initialization if needed
  generateEvent("Autoverse DCA Engine initialized");
}