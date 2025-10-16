import {
  Context,
  deferredCallRegister,
  generateEvent,
  Slot,
} from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { VaultStorage } from './storage';
import { VaultConfig, VaultData, VaultStatus, Address } from './types';
import { WAGMIDEX } from './dex';
import { MassaStaking } from './staking';

export class DCAEngine {
  private static readonly MAX_BATCH_SIZE: u32 = 8;

  static initializeVault(vaultId: string, config: VaultConfig): void {
    const vaultData = new VaultData(
      config,
      Context.currentPeriod() + config.interval,
      0,
      VaultStatus.ACTIVE,
      Context.currentPeriod(),
    );

    VaultStorage.set(vaultId, vaultData);
    VaultStorage.addUserVault(config.owner, vaultId);
    VaultStorage.addActiveVault(vaultId);

    // Schedule first execution
    this.scheduleExecution(vaultId, config.interval);

    generateEvent(`VaultCreated: ${vaultId} for ${config.owner}`);
  }

  static executeDCA(vaultId: string): void {
    const vault = VaultStorage.get(vaultId);
    if (!vault || vault.status !== VaultStatus.ACTIVE) {
      return;
    }

    // Check if it's time to execute
    if (Context.currentPeriod() < vault.nextExecution) {
      return;
    }

    // Execute the swap
    const swapResult = WAGMIDEX.swapExactTokensForTokens(
      vault.config.amount,
      vault.config.baseToken,
      vault.config.targetToken,
      vault.config.owner,
    );

    if (swapResult.success && swapResult.amountOut > 0) {
      // Auto-compound if enabled
      if (vault.config.autoCompound) {
        MassaStaking.deposit(swapResult.amountOut, vault.config.owner);
      }

      // Update vault state
      vault.totalExecutions++;
      vault.nextExecution = Context.currentPeriod() + vault.config.interval;

      VaultStorage.set(vaultId, vault);

      // Schedule next execution
      this.scheduleExecution(vaultId, vault.config.interval);

      generateEvent(
        `DCAExecuted: ${vaultId} swapped ${vault.config.amount} for ${swapResult.amountOut}`,
      );
    } else {
      // Mark vault as having insufficient balance
      vault.status = VaultStatus.INSUFFICIENT_BALANCE;
      VaultStorage.set(vaultId, vault);
      VaultStorage.removeActiveVault(vaultId);

      generateEvent(`DCAFailed: ${vaultId} - swap failed`);
    }
  }

  static executeBatchDCA(vaultIds: string[]): void {
    for (let i = 0; i < Math.min(vaultIds.length, this.MAX_BATCH_SIZE); i++) {
      this.executeDCA(vaultIds[i]);
    }

    // Reschedule next batch if there are more vaults to process
    const remainingVaults = VaultStorage.getActiveVaults();
    if (remainingVaults.length > 0) {
      this.scheduleBatchExecution(remainingVaults);
    }
  }

  private static scheduleExecution(vaultId: string, interval: u32): void {
    const maxGas: u64 = 200000; // Gas limit for the execution
    const coins: u64 = 0; // Coins to be sent with the call
    const targetPeriod = Context.currentPeriod() + interval;
    const targetThread = Context.currentThread();
    const targetSlot: Slot = new Slot(targetPeriod, targetThread);

    deferredCallRegister(
      Context.callee() as unknown as string,
      'executeDCA',
      targetSlot,
      maxGas,
      new Args().add(vaultId).serialize(),
      coins,
    );
  }

  private static scheduleBatchExecution(vaultIds: string[]): void {
    const nextBatch = vaultIds.slice(0, this.MAX_BATCH_SIZE);
    const maxGas: u64 = 1000000; // Gas limit for the batch execution
    const coins: u64 = 0; // Coins to be sent with the call
    const targetPeriod = Context.currentPeriod() + 5; // 5 periods from now
    const targetThread = Context.currentThread();
    const targetSlot: Slot = new Slot(targetPeriod, targetThread);

    deferredCallRegister(
      Context.callee() as unknown as string,
      'executeBatchDCA',
      targetSlot,
      maxGas,
      new Args().add(nextBatch.join(',')).serialize(),
      coins,
    );
  }

  static cancelVault(vaultId: string, caller: Address): boolean {
    const vault = VaultStorage.get(vaultId);
    if (!vault || vault.config.owner !== caller) {
      return false;
    }

    vault.status = VaultStatus.PAUSED;
    VaultStorage.set(vaultId, vault);
    VaultStorage.removeActiveVault(vaultId);

    generateEvent(`VaultCancelled: ${vaultId}`);
    return true;
  }

  static getVaultInfo(vaultId: string): VaultData | null {
    return VaultStorage.get(vaultId);
  }
}