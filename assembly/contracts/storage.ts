import { VaultData, Address, VaultConfig, VaultStatus } from "./types";
import { Storage } from '@massalabs/massa-as-sdk';
import { stringToBytes, bytesToString } from "@massalabs/as-types";

export class VaultStorage {
  // Add ': string' type annotation to these lines
  private static readonly VAULT_PREFIX: string = "vault_";
  private static readonly USER_VAULTS_PREFIX: string = "user_vaults_";
  private static readonly ACTIVE_VAULTS_KEY: string = "active_vaults";

  static set(vaultId: string, data: VaultData): void {
    const serialized = this.serializeVaultData(data);
    Storage.set(stringToBytes(this.VAULT_PREFIX + vaultId), stringToBytes(serialized));
  }

  static get(vaultId: string): VaultData | null {
    if (!Storage.has(stringToBytes(this.VAULT_PREFIX + vaultId))) {
      return null;
    }
    const serialized = bytesToString(Storage.get(stringToBytes(this.VAULT_PREFIX + vaultId)));
    return this.deserializeVaultData(serialized);
  }

  static delete(vaultId: string): void {
    Storage.del(stringToBytes(this.VAULT_PREFIX + vaultId));
  }

  static addUserVault(user: Address, vaultId: string): void {
    const userVaults = this.getUserVaults(user);
    userVaults.push(vaultId);
    Storage.set(stringToBytes(this.USER_VAULTS_PREFIX + user), stringToBytes(userVaults.join(",")));
  }

  static getUserVaults(user: Address): string[] {
    const key = stringToBytes(this.USER_VAULTS_PREFIX + user);
    if (!Storage.has(key)) {
        return [];
    }
    const data = bytesToString(Storage.get(key));
    return data ? data.split(",").filter(id => id.length > 0) : [];
  }

  static addActiveVault(vaultId: string): void {
    const activeVaults = this.getActiveVaults();
    if (!activeVaults.includes(vaultId)) {
      activeVaults.push(vaultId);
      Storage.set(stringToBytes(this.ACTIVE_VAULTS_KEY), stringToBytes(activeVaults.join(",")));
    }
  }

  static getActiveVaults(): string[] {
    const key = stringToBytes(this.ACTIVE_VAULTS_KEY);
    if (!Storage.has(key)) {
        return [];
    }
    const data = bytesToString(Storage.get(key));
    return data ? data.split(",").filter(id => id.length > 0) : [];
  }

  static removeActiveVault(vaultId: string): void {
    const activeVaults = this.getActiveVaults();
    const index = activeVaults.indexOf(vaultId);
    if (index > -1) {
      activeVaults.splice(index, 1);
      Storage.set(stringToBytes(this.ACTIVE_VAULTS_KEY), stringToBytes(activeVaults.join(",")));
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
        U32.parseInt(parts[3]), U64.parseInt(parts[4]), parts[5] === "1"
      ),
      U64.parseInt(parts[6]),
      U32.parseInt(parts[7]),
      U32.parseInt(parts[8]) as VaultStatus, // Consider using a safer way to cast enum
      U64.parseInt(parts[9])
    );
  }
}