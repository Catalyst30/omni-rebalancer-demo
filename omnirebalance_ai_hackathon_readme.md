# OmniRebalance AI

**Autonomous Cross-Chain Portfolio Protection Powered by NEAR Intents & Chain Signatures**

*Built for the NEAR Hackathon — Tracks: `defi` (Unstoppable DeFi), `business` (Autonomous Business), `agents` (Agent Economy)*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://omni-rebalancer-demo.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 1. The Problem
Managing digital assets across fragmented blockchains (Solana, Ethereum, Bitcoin, Avalanche) exposes everyday users and Web3 treasuries to sudden market crashes. 
* **Slow Manual Reactions:** During flash crashes, users must manually bridge assets, switch wallets, pay gas fees on multiple networks, and execute DEX swaps—often losing capital before transactions settle.
* **Complex UX & Custody Risks:** Existing cross-chain tools require users to either surrender custody to centralized exchanges or manage complex seed phrases and gas tokens across every individual chain.

## 2. The Solution: OmniRebalance AI
**OmniRebalance AI** is a non-custodial, consumer-friendly financial agent that monitors multi-chain portfolios 24/7 and automatically converts volatile assets into stable digital cash (USDC) whenever user-defined risk thresholds are breached.

### Key Features
* **Plain-English Consumer Experience:** Strips away blockchain jargon (*MPC derivation paths, gas auctions*) in favor of intuitive safety controls (*Drop Limit Thresholds, Automated Safety Shield*).
* **Non-Custodial Security:** Users retain full ownership of their funds at all times; the AI agent only holds scoped permissions to trigger defensive rebalancing when crash thresholds are hit.
* **Zero Gas Overhead for Users:** Leverages intent-based solver auctions so third-party solvers compete to fulfill cross-chain swaps without the user needing native gas tokens on destination chains.

---

## 3. How NEAR Protocol Powers OmniRebalance AI
OmniRebalance AI utilizes NEAR's chain abstraction stack as its core settlement and security layer:

1. **NEAR Chain Signatures (MPC):** Enables a single NEAR account to deterministically derive addresses and sign transactions natively across foreign blockchains (Solana, Ethereum, Bitcoin, Avalanche) without requiring users to manage separate wallets or bridges.
2. **NEAR Intents (`intents.near.org`):** When a token breaches its drop limit (e.g., `-15%`), the agent broadcasts a cross-chain swap intent. Decentralized solvers compete to execute the swap into USDC at optimal execution rates, abstracting away liquidity fragmentation and gas costs.
3. **Rule-Based Risk Guardrails:** Enforces strict on-chain parameters so the AI can only rebalance into approved stablecoins (`USDC`) within user-configured volatility limits.

---

## 4. How to Try the Demo (Judge Verification Steps)

You can test the live interactive MVP immediately in your browser without wallet setup or mainnet funds *(per NEAR Hackathon Rule Q-007 & Q-012)*:

1. **Open the Live Application:** Visit **[https://omni-rebalancer-demo.vercel.app](https://omni-rebalancer-demo.vercel.app)**.
2. **Inspect Your Multi-Chain Portfolio (`My Portfolio` tab):**
   * **Action:** View the starting `$400.00` portfolio distributed evenly across **Solana (`SOL`)**, **Ethereum (`ETH`)**, **Bitcoin (`BTC`)**, and **Avalanche (`AVAX`)**.
   * **Action:** Adjust the **AI Protection Setting** slider (default `-15% Drop Limit`) to set your custom risk sensitivity.
3. **Simulate a Flash Crash (`Live Market Test` tab):**
   * **Action:** Switch to the **Live Market Test** tab and click **"Simulate Solana Flash Crash (-18%)"** or **"Simulate Ethereum Volatility (-15%)"**.
   * **Expected Result:** A real-time alert banner triggers, the crashing token is automatically liquidated at its stop-loss threshold, and the preserved capital is immediately credited to your **Safe Cash Storage (`USDC`)** balance on the `My Portfolio` tab.
4. **Review the Plain-English Breakdown (`How It Works` tab):**
   * **Action:** Click **How It Works** to inspect the 3-step consumer workflow explaining 24/7 monitoring, automated safety shields, and zero-gas solver execution.

---

## 5. Local Setup & Reproducibility

To run the project locally on your machine:

### Prerequisites
* Node.js (`v18+`) and `npm`

### Installation & Run
```bash
# 1. Clone the public repository
git clone https://github.com/Catalyst30/omni-rebalancer-demo.git
cd omni-rebalancer-demo

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
```
Open the local URL displayed in your terminal (typically `http://localhost:5173`) to view the application.

---

## 6. Hackathon Disclosures & Architecture Notes
* **MVP Simulation Scope:** Per **Rule Q-007** (*NEAR Intents operates on mainnet without a public testnet*), this MVP simulates real-time price volatility and intent settlement locally in the browser so judges can safely test flash-crash scenarios with zero financial risk.
* **Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
* **Deployment:** Hosted on Vercel with SPA routing (`vercel.json`).

---

## License
This project is licensed under the **MIT License**.