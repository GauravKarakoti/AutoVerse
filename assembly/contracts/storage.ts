import { VaultData, Address } from "./types";

export class VaultStorage {
  private static readonly VAULT_PREFIX = "vault_";
  private static readonly USER_VAULTS_PREFIX = "user_vaults_";
  private static readonly ACTIVE_VAULTS_KEY = "active_vaults";

  static set(vaultId: string, data: VaultData): void {
    const serialized = this.serializeVaultData(data);
    Storage.setData(this.VAULT_PREFIX + vaultId, serialized);
  }

  static get(vaultId: string): VaultData | null {
    const serialized = Storage.getData(this.VAULT_PREFIX + vaultId);
    return serialized ? this.deserializeVaultData(serialized) : null;
  }

  static delete(vaultId: string): void {
    Storage.setData(this.VAULT_PREFIX + vaultId, "");
  }

  static addUserVault(user: Address, vaultId: string): void {
    const userVaults = this.getUserVaults(user);
    userVaults.push(vaultId);
    Storage.setData(this.USER_VAULTS_PREFIX + user, userVaults.join(","));
  }

  static getUserVaults(user: Address): string[] {
    const data = Storage.getData(this.USER_VAULTS_PREFIX + user);
    return data ? data.split(",").filter(id => id.length > 0) : [];
  }

  static addActiveVault(vaultId: string): void {
    const activeVaults = this.getActiveVaults();
    if (!activeVaults.includes(vaultId)) {
      activeVaults.push(vaultId);
      Storage.setData(this.ACTIVE_VAULTS_KEY, activeVaults.join(","));
    }
  }

  static getActiveVaults(): string[] {
    const data = Storage.getData(this.ACTIVE_VAULTS_KEY);
    return data ? data.split(",").filter(id => id.length > 0) : [];
  }

  static removeActiveVault(vaultId: string): void {
    const activeVaults = this.getActiveVaults();
    const index = activeVaults.indexOf(vaultId);
    if (index > -1) {
      activeVaults.splice(index, 1);
      Storage.setData(this.ACTIVE_VAULTS_KEY, activeVaults.join(","));
    }
  }

  private static serializeVaultData(data: VaultData): string {
    return `${data.config.owner},${data.config.baseToken},${data.config.targetToken},${data.config.interval},${data.config.amount},${data.config.autoCompound ? 1 : 0},${data.nextExecution},${data.totalExecutions},${data.status},${data.createdAt}`;
  }

  private static deserializeVaultData(serialized: string): VaultData {
    const parts = serialized.split(",");
    return new VaultData(
      new VaultConfig(
        parts[0], parts[1], parts[2],
        u32(parseInt(parts[3])), u64(parseInt(parts[4])), parts[5] === "1"
      ),
      u64(parseInt(parts[6])),
      u32(parseInt(parts[7])),
      u32(parseInt(parts[8])) as any,
      u64(parseInt(parts[9]))
    );
  }
}