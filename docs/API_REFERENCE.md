# API Reference

Complete API documentation for Autoverse smart contracts and frontend utilities.

## 📋 Overview

This document covers:
- Smart Contract functions and events
- Frontend utility functions
- Massa Web3 adapter methods
- React hooks and components

## 🔗 Smart Contract API

### Contract Addresses

| Contract | Testnet Address | Mainnet Address |
|----------|-----------------|-----------------|
| DCA Engine | `AS1VQAHJ1QcG6dvbQx7c6SyLNK3YqL8cS7a2T` | `TBD` |
| Vault Factory | `AS1Factory123456789012345678901234` | `TBD` |
| NFT Vault | `AS1NFTV4ULT5H4T3V0Lv3N0W2aTCH` | `TBD` |

### Core Functions

#### `createVault`
Creates a new autonomous DCA vault.

**Parameters:**
```typescript
baseToken: string      // Address of token to sell
targetToken: string    // Address of token to buy  
interval: u32         // Execution interval in hours
amount: u64           // Amount per swap (in base token decimals)
autoCompound: boolean // Whether to auto-stake received tokens
```
**Returns:**
```typescript
vaultId: string // Unique vault identifier
```
**Example:**
```typescript
const vaultId = await massaWeb3.callContract(
  'AS1VQAHJ1QcG6dvbQx7c6SyLNK3YqL8cS7a2T',
  'createVault',
  'AS12USDCtest12345678901234567890,AS12MASSA1234567890123456789012,24,1000000,1',
  '100000000' // 0.1 MASSA gas
);
```
#### `executeDCA`
Executes a DCA swap for a specific vault (called autonomously).

**Parameters:**
```typescript
vaultId: string // Vault identifier to execute
```
**Returns**: `void`

**Events Emitted:**
```typescript
DCAExecuted: {
  vaultId: string,
  amountIn: u64,
  amountOut: u64,
  timestamp: u64
}
```
#### `cancelVault`
Cancels an active vault and stops future executions.

**Parameters:**
```typescript
vaultId: string // Vault identifier to cancel
```
**Returns:**
```typescript
success: boolean // Whether cancellation was successful
```
**Example:**
```typescript
const success = await massaWeb3.callContract(
  'AS1VQAHJ1QcG6dvbQx7c6SyLNK3YqL8cS7a2T',
  'cancelVault',
  'vault_1234567890_abc123'
);
```
#### `getVaultInfo`
Retrieves detailed information about a vault.

**Parameters:**
```typescript
vaultId: string // Vault identifier
```
**Returns:**
```typescript
string // Comma-separated vault data
// Format: owner,baseToken,targetToken,interval,amount,autoCompound,nextExecution,totalExecutions,status,createdAt
```
**Example Response:**
```text
AS12user123456789012345678901234,AS12USDCtest12345678901234567890,AS12MASSA1234567890123456789012,24,1000000,1,1234567890,15,0,1234567800
```
#### `getUserVaults`
Gets all vault IDs for a specific user.

**Parameters:**
```typescript
userAddress: string // User's wallet address
```
**Returns:**
```typescript
string[] // Array of vault IDs
```

### View Functions (Read-Only)
#### `getActiveVaults`
Returns all currently active vaults.

**Returns**: string[]

#### `getVaultPerformance`
Gets performance metrics for a vault.

**Parameters:**
```typescript
vaultId: string
```
**Returns:**
```typescript
{
  totalInvested: u64,
  totalReceived: u64,
  averagePrice: u64,
  executions: u32
}
```

### Events
#### `VaultCreated`
Emitted when a new vault is created.
```typescript
event VaultCreated {
  vaultId: string,
  owner: string,
  baseToken: string,
  targetToken: string,
  interval: u32,
  amount: u64
}
```
#### `DCAExecuted`
Emitted when a DCA swap is successfully executed.
```typescript
event DCAExecuted {
  vaultId: string,
  amountIn: u64,
  amountOut: u64,
  timestamp: u64
}
```
#### `VaultCancelled`
Emitted when a vault is cancelled.
```typescript
event VaultCancelled {
  vaultId: string,
  owner: string,
  reason: string
}
```

## 🌐 Frontend API
### MassaWeb3 Adapter
#### `connect()`
Connects to Massa Station wallet.

**Returns**: `Promise<boolean>`

**Example:**
```typescript
const isConnected = await massaWeb3.connect();
```
#### `callContract()`
Calls a smart contract function.

**Parameters:**
```typescript
{
  target: string,     // Contract address
  function: string,   // Function name
  parameter: string,  // Function parameters
  coins?: string      // MASSA amount to send (optional)
}
```
**Returns**: `Promise<IOperation>`

**Example:**
```typescript
const result = await massaWeb3.callContract({
  target: 'AS1VQAHJ1QcG6dvbQx7c6SyLNK3YqL8cS7a2T',
  function: 'createVault',
  parameter: 'AS12USDCtest12345678901234567890,AS12MASSA1234567890123456789012,24,1000000,1',
  coins: '100000000'
});
```
#### `readContract()`
Reads data from a smart contract (view function).

**Parameters:**
```typescript
target: string,     // Contract address
function: string,   // Function name  
parameter: string   // Function parameters
```
**Returns**: `Promise<string>`

#### `getBalance()`
Gets the balance of a wallet address.

**Parameters:**
```typescript
address?: string // Optional, uses connected wallet if not provided
```
**Returns**: `Promise<string>`

### React Hooks
#### `useVaults()`
Manages vault operations and state.

**Returns**:
```typescript
{
  vaults: VaultData[],           // Array of user's vaults
  loading: boolean,              // Loading state
  error: string | null,          // Error message
  createVault: (config: VaultConfig) => Promise<string>, // Create new vault
  cancelVault: (vaultId: string) => Promise<void>,      // Cancel vault
  refreshVaults: () => Promise<void>                    // Refresh data
}
```
**Example:**
```typescript
const { vaults, loading, createVault } = useVaults();

const handleCreate = async () => {
  try {
    const vaultId = await createVault({
      baseToken: 'AS12USDCtest...',
      targetToken: 'AS12MASSA...',
      interval: 24,
      amount: '1000000',
      autoCompound: true
    });
    console.log('Vault created:', vaultId);
  } catch (error) {
    console.error('Failed to create vault:', error);
  }
};
```
#### `useWallet()`
Manages wallet connection state.

**Returns:**
```typescript
{
  isConnected: boolean,
  account: string | null,
  balance: string,
  connect: () => Promise<void>,
  disconnect: () => void
}
```

### Utility Functions
#### `parseVaultData()`
Parses raw vault data from contract into structured object.

**Parameters:**
```typescript
rawData: string // Raw data from getVaultInfo
```
**Returns**: `VaultData`

#### `calculateGasEstimate()`
Estimates gas cost for a contract call.

**Parameters:**
```typescript
functionName: string,
parameters: any[]
```
**Returns**: `string` (gas amount in nanomassa)

## 🔄 WebSocket Events
### Real-time Subscriptions
#### `vaultUpdated`
Emitted when any vault state changes.
```typescript
massaWeb3.subscribeToEvents('vaultUpdated', (event) => {
  console.log('Vault updated:', event.vaultId, event.data);
});
```
#### `dcaExecuted`
Emitted when a DCA execution completes.
```typescript
massaWeb3.subscribeToEvents('dcaExecuted', (event) => {
  console.log('DCA executed:', event.vaultId, event.amountOut);
});
```

## 📊 Error Codes
| Code | Message | Description  |
|------|---------|--------------|
| 1001 | INSUFFICIENT_BALANCE | User doesn't have enough tokens |
| 1002 | VAULT_NOT_FOUND | Specified vault doesn't exist |
| 1003 | UNAUTHORIZED_ACCESS | User doesn't own the vault |
| 1004 | INVALID_PARAMETERS | Function parameters are invalid |
| 1005 | CONTRACT_PAUSED | Contract operations are paused |
| 2001 | NETWORK_ERROR | Network connection issue |
| 2002 | WALLET_NOT_CONNECTED | User wallet not connected |

## 🧪 Testing Utilities
### Mock Data Generator
```typescript
import { generateMockVault } from '../utils/test-utils';

const mockVault = generateMockVault({
  status: 'ACTIVE',
  executions: 5,
  interval: 24
});
```
### Contract Testing
```typescript
describe('DCA Engine', () => {
  it('should create vault with correct parameters', async () => {
    const vaultId = await createVault(testConfig);
    expect(vaultId).toMatch(/vault_/);
  });
});
```