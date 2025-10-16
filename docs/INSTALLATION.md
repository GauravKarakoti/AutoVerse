# Installation Guide

Complete setup and deployment instructions for Autoverse.

## 🏁 Quick Start

### Prerequisites

- **Node.js** 16.0 or higher
- **npm** 7.0 or higher
- **Massa Station Wallet** with testnet tokens
- **Git** for version control

### One-Line Install (Development)

```bash
git clone https://github.com/GauravKarakoti/autoverse.git && cd autoverse && npm run setup:dev
```

## 🛠️ Detailed Installation
### 1. System Requirements

**Minimum Requirements**
- 2GB RAM
- 10GB free disk space
- Node.js 16+
- Modern web browser

**Recommended Requirements**
- 4GB RAM
- 20GB free disk space
- Node.js 18+
- Massa Station Wallet extension

### 2. Environment Setup
**Clone Repository**
```bash
git clone https://github.com/GauravKarakoti/autoverse.git
cd autoverse
```
**Install Dependencies**

**Root Dependencies:**
```bash
npm install
```
**Smart Contract Dependencies:**
```bash
cd contract
npm install
```
**Frontend Dependencies:**
```bash
cd ../frontend
npm install
```

### 3. Configuration
**Environment Variables**

Create `.env` file in project root:
```env
# Network Configuration
MASSA_NETWORK=testnet
MASSA_RPC_URL=https://test.massa.net/api/v2
MASSA_WEBSOCKET_URL=wss://test.massa.net/api/v2

# Contract Addresses (Will be filled after deployment)
CONTRACT_DCA_ENGINE=
CONTRACT_VAULT_FACTORY=
CONTRACT_NFT_VAULT=

# Frontend Configuration
VITE_APP_NAME=Autoverse
VITE_APP_VERSION=1.0.0
VITE_DEFAULT_RPC=https://test.massa.net/api/v2
```
**Testnet Token Setup**

1. Install [Massa Station](https://station.massa.net/)
2. Get testnet tokens from faucet:
```bash
# Join Massa Discord and use faucet bot
!faucet <your_wallet_address>
```
3. Verify token balance in Massa Station

### 4. Smart Contract Deployment
**Build Contracts**
```bash
cd contract
npm run build
```
**Deploy to Testnet**
```bash
npm run deploy:testnet
```
**Verify Deployment**
```bash
npm run verify:contracts
```
Expected output:
```text
✅ DCA Engine deployed: AS1VQAHJ1QcG6dvbQx7c6SyLNK3YqL8cS7a2T
✅ Vault Factory deployed: AS1Factory123456789012345678901234
✅ NFT Vault deployed: AS1NFTV4ULT5H4T3V0Lv3N0W2aTCH
```

### 5. Frontend Deployment
**Development Build**
```bash
cd frontend
npm run dev
```
Access at: `http://localhost:3000`

**Production Build**
```bash
npm run build
```
**DeWeb Deployment**
```bash
npm run deploy:deweb
```
Expected output:
```text
✅ Frontend deployed to DeWeb
🌍 Access at: https://autoverse.massa
```

### 6. Verification Steps
**Contract Verification**
```bash
cd contract
npm run test:integration
```
**Frontend Verification**

1. Open https://autoverse.massa
2. Connect Massa Station wallet
3. Create a test vault with minimal amount
4. Verify vault appears in dashboard
5. Wait for first execution (check console logs)

### 7. Troubleshooting Common Issues
**Contract Deployment Fails**

**Problem**: Insufficient gas or network issues

**Solution**:
```bash
# Check balance
npm run check-balance

# Increase gas limit
# Check balance
npm run check-balance

# Increase gas limit
export GAS_LIMIT=100000000
npm run deploy:testnet
```
**Frontend Build Fails**

**Problem**: Dependency or configuration issues

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version # Should be 16+
```
**Wallet Connection Issues**

**Problem**: Massa Station not detected

**Solution**:

1. Ensure Massa Station is installed and unlocked
2. Check if on correct network (testnet)
3. Refresh page and retry connection

### 8. Production Deployment
**Smart Contract Mainnet**
```bash
cd contract
npm run deploy:mainnet
```
**Frontend Production**
```bash
cd frontend
npm run build:production
npm run deploy:deweb:production
```

### 9. Monitoring and Maintenance
**Health Checks**
```bash
# Contract health
npm run healthcheck:contracts

# Frontend health  
npm run healthcheck:frontend

# Performance metrics
npm run metrics
```
**Logs and Monitoring**
```bash
# View contract events
npm run logs:contracts

# Monitor vault executions
npm run monitor:vaults

# Performance analytics
npm run analytics
```

## 🎯 Next Steps
After successful installation:

1. Explore the UI: Create your first DCA vault
2. Read Technical Specs: Understand the architecture
3. Join Community: Get help and share feedback
4. Contribute: Help improve Autoverse

## 📞 Support
If you encounter issues during installation:

1. Check the Troubleshooting Guide
2. Search GitHub Issues
3. Ask in Discord