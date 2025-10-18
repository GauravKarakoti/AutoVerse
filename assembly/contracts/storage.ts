import { VaultData, Address, VaultConfig, VaultStatus } from "./types";
import { Storage } from '@massalabs/massa-as-sdk';
import { stringToBytes, bytesToString } from "@massalabs/as-types";
import { RegExp } from 'assemblyscript/std/assembly/regexp';

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
    const rawBytes = Storage.get(key);
    if (rawBytes.length === 0 || rawBytes.every(byte => byte === 0)) {
      return [];
    }
    const data = bytesToString(rawBytes);

    // Create a RegExp object
    const nullByteRegex = new RegExp('^[\\x00]*$');

    // Check the decoded string
    if (!data || nullByteRegex.test(data)) {
      return [];
    }

    // --- Start Change ---
    // Replace filter with a for loop to avoid closure
    const initialIds = data.split(",");
    const filteredIds: string[] = [];
    for (let i = 0; i < initialIds.length; i++) {
        const id = initialIds[i];
        if (id.length > 0 && !nullByteRegex.test(id)) {
            filteredIds.push(id);
        }
    }
    return filteredIds;
    // --- End Change ---
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
    // Ensure you handle potential parsing errors if parts aren't as expected
    if (parts.length < 10) {
      // Maybe throw an error or return a default/error state
      // For now, let's assume it parses correctly or handle specific errors later
      // This is just a placeholder comment for robustness
    }
    const owner = parts[0];
    const baseToken = parts[1];
    const targetToken = parts[2];
    const interval = U32.parseInt(parts[3]);
    const amount = U64.parseInt(parts[4]);
    const autoCompound = parts[5] === "1";
    const nextExecution = U64.parseInt(parts[6]);
    const totalExecutions = U32.parseInt(parts[7]);
    // It's safer to handle enum parsing explicitly
    let status: VaultStatus;
    const statusInt = U32.parseInt(parts[8]);
    if (statusInt == VaultStatus.ACTIVE) status = VaultStatus.ACTIVE;
    else if (statusInt == VaultStatus.PAUSED) status = VaultStatus.PAUSED;
    else if (statusInt == VaultStatus.COMPLETED) status = VaultStatus.COMPLETED;
    else if (statusInt == VaultStatus.INSUFFICIENT_BALANCE) status = VaultStatus.INSUFFICIENT_BALANCE;
    else status = VaultStatus.PAUSED; // Default or throw error
    const createdAt = U64.parseInt(parts[9]);

    return new VaultData(
      new VaultConfig(owner, baseToken, targetToken, interval, amount, autoCompound),
      nextExecution,
      totalExecutions,
      status,
      createdAt
    );
  }
}