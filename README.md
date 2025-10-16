# 🪐 Autoverse

**Your Self-Operating DeFi Universe.**

Autoverse leverages the power of Massa's Autonomous Smart Contracts (ASCs) to create DeFi applications that run forever, trustlessly, and without any middlemen. The first product is a fully autonomous Dollar-Cost Averaging (DCA) vault.

## ✨ What It Does

*   **Set & Forget DCA:** Deposit funds, set your strategy (e.g., "Buy $MASSA every 24 hours"), and walk away. The vault handles the rest.
*   **Truly Decentralized:** No reliance on Gelato, Chainlink, or any other off-chain keeper network. Execution is guaranteed by the Massa protocol.
*   **Auto-Compounding:** Swapped assets are automatically staked or deposited into yield-bearing strategies within the same transaction, maximizing returns.
*   **Unstoppable Frontend:** The entire dApp UI is hosted on-chain via Massa's **DeWeb**, ensuring it is always accessible and censorship-resistant.

## 🚀 Live Demo

*   **DeWeb Frontend:** `https://autoverse.massa`
*   **Testnet Contract Address:** `AS12...XYZ`

## 🛠️ How to Run / Install

### Prerequisites
- **Massa Station Wallet:** Install the Massa Station wallet and get some testnet $MASSA from the faucet.
- **Web Browser:** A modern browser like Chrome, Firefox, or Brave.

### For Users
1.  Navigate to the Autoverse DeWeb URL in your browser.
2.  Connect your Massa Station wallet.
3.  On the "Create Vault" page, select:
    - **Base Token:** The token you're selling (e.g., USDC-test).
    - **Target Token:** The token you're buying (e.g., MASSA-test).
    - **Interval:** How often to execute (e.g., 24 hours).
    - **Amount per Swap:** The amount of Base Token to swap each interval.
4.  Approve the token spending and deploy your vault. That's it! Your autonomous investing strategy is now live.

### For Developers

#### Smart Contract
1.  **Clone the repo:**
    ```bash
    git clone https://github.com/GauravKarakoti/autoverse.git
    cd autoverse/contract
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Compile the contract:**
    ```bash
    npm run build
    ```
4.  **Deploy to Massa Testnet:**
    ```bash
    npm run deploy
    ```

#### Frontend (DeWeb)
1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run a local development server:**
    ```bash
    npm run dev
    ```
4.  **Build for DeWeb deployment:**
    ```bash
    npm run build
    ```
    This creates a `dist` folder. Use the Massa DeWeb deployment tool to upload this folder to the blockchain.

## 🧠 Technical Deep Dive

### Core Concept: The Autonomous Vault
The magic lies in the `DCAAsc` smart contract. Key functions:

*   `createVault`: Initializes a new user vault and schedules the first execution using `context.deferredCall`.
*   `executeDCA`: The heart of the ASC. This function is called autonomously by the Massa network. It:
    1.  Executes the swap on a integrated DEX.
    2.  Deposits the received tokens into a staking contract.
    3.  Calculates the timestamp for the next execution.
    4.  Calls `deferredCall` again on *itself* to schedule the next run.
*   `cancelVault`: Allows a user to stop the strategy and withdraw their remaining funds, canceling any pending deferred calls.

### Architecture
```text
User (DeWeb UI) <-> Massa Wallet <-> DCAAsc Smart Contract
│
├──> DEX (Swap)
└──> Staking Contract (Compound)
```
The system is a closed loop, with the ASC acting as the perpetual engine.

## 🏗️ Challenges & Solutions

| Challenge | Solution |
| :--- | :--- |
| **Perpetual Scheduling** | Each `executeDCA` call is responsible for scheduling the next one, creating a recursive, self-perpetuating cycle. We handle potential missed calls by checking the current block timestamp against the target. |
| **Gas Management** | The contract is optimized to perform the swap, staking, and rescheduling in as few operations as possible. We also allow users to fund their vault with a small amount of $MASSA to cover future gas fees for the autonomous calls. |
| **DeWeb Hosting** | We used Vite for its small bundle size and static asset optimization, ensuring the frontend was cost-effective to deploy on-chain. |

## 📚 Resources

*   [Massa Documentation](https://docs.massa.net/)
*   [Autonomous Smart Contracts Guide](https://docs.massa.net/en/latest/web3/asc.html)
*   [DeWeb Deployment Tutorial](https://docs.massa.net/en/latest/web3/deweb.html)
*   [Massa Discord for Support](https://discord.gg/massanetwork)

## 👥 Team

Built with ❤️ by [Gaurav Karakoti] for the Massa Builders campaign.