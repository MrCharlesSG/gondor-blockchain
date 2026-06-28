# Gondor Blockchain Infrastructure

This repository manages the on-chain smart contracts and deployment infrastructure for the **Gondor** ecosystem. Built using **Hardhat**, it deploys the **Soulbound Token (SBT)** for user identity, binds the custom **Zero-Knowledge (ZK) Prover Verifier** to on-chain state updates, and handles administrative scripts.

---

## Smart Contracts (`contracts/`)

### 1. `GondorSovereignIdentity.sol`
The central contract of the Gondor ecosystem. It represents users' financial identities as non-transferable Soulbound Tokens (SBT) and implements:
*   **Soulbound Behavior:** Custom overrides blocking standard ERC-721 token transfers (tokens cannot be sold or moved, except for administrative key recoveries/handovers).
*   **Decentralized Identifier (DID) Registry:** Links each SBT to an off-chain DID.
*   **Transaction Batch Notarization:** Exposes `anchorRoot` which stores Merkle Roots of Poseidon-hashed transactions committed by the Pelargir backend.
*   **Zero-Knowledge Reputation Updates:** Exposes `updateReputationWithProof`, which validates user-submitted ZK proofs against canonical roots using the assigned verifier contract. If verified, it calculates the user's new reputation levels (Invested ROI and Realized ROI).
*   **Heartbeat Monitor:** Exposes functions to monitor activity. Anyone can call `revokeExpiredReputation` if the token has not received a heartbeat updates within the configured window, resetting the user's reputation back to 0.

### 2. `Verifier.sol`
A cryptographic verifier contract compiled and generated from the Circom zero-knowledge circuit `tx_verifier.circom` using **SnarkJS** (Groth16 protocol). It handles the bilinear pairing computations required to prove that off-chain trading calculations correspond to the signed, anchored Merkle Roots.

### 3. `VerifierWrapper.sol`
An adapter contract implementing `IGondorVerifier`. It sits between `GondorSovereignIdentity` and the auto-generated `Verifier.sol`. It decodes the generalized proof payload and maps the public variables (token ID, old/new costs, old/new revenues, Merkle tree batch roots) into the exact ordering required by the mathematical ZK verification contract.

---

## Directory Structure

```text
gondor-blockchain/
├── contracts/          # Solidity source files (SBT and Verifier contracts)
│   └── test/           # Mock contracts used during testing
├── ignition/           # Hardhat Ignition deployment modules
├── scripts/            # Deployment and state management scripts
│   ├── check-state.ts      # Queries the blockchain to inspect user SBT states
│   ├── deploy.ts           # Orchestrates deployment and automatically updates local configs
│   ├── expire-token.ts     # Triggers on-chain expiration checks for user heartbeats
│   ├── get-address.ts      # Utility to get deployment addresses
│   └── update_verifier.ts  # Links new verifier wrappers to the identity contract
├── test/               # Smart contract unit tests
├── hardhat.config.ts   # Hardhat configuration (Amoy, local network, compiler parameters)
├── package.json        # NPM package dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

---

## Configuration & Environment

Create a `.env` file in the root of this folder to store your network configuration:

```env
PRIVATE_KEY="your-deployer-private-key-hex"
AMOY_RPC_URL="https://polygon-amoy.g.alchemy.com/v2/your-api-key"
ETHERSCAN_API_KEY="your-polygonscan-api-key"
```

*   `PRIVATE_KEY` is required to sign deployments and contract transactions.
*   `AMOY_RPC_URL` is required if deploying to the Polygon Amoy testnet.

---

## Getting Started

### Prerequisites
*   **Node.js** (version 18+ recommended)
*   **npm** or **yarn**

### Installation
Install project dependencies:
```bash
npm install
```

### Common Tasks

#### Compile Smart Contracts
Compile the Solidity code and generate TypeChain typescript bindings:
```bash
npx hardhat compile
```

#### Run Unit Tests
Execute the Solidity tests using Mocha and Chai:
```bash
npx hardhat test
```

#### Run Local Blockchain Node
Spin up a local EVM network node running on `http://127.0.0.1:8545` (default network ID: `31337`):
```bash
npx hardhat node
```

#### Deploy Contracts
Deploys the identity contract, verifier, wrapper, links them, and copies the contract addresses to the local backend config.

*   **To local network node:**
    ```bash
    npx hardhat run scripts/deploy.ts --network localhost
    ```
*   **To Polygon Amoy testnet:**
    ```bash
    npx hardhat run scripts/deploy.ts --network amoy
    ```

---

## Administrative Scripts Reference

*   **Deploy Script (`scripts/deploy.ts`):** 
    Deploys `GondorSovereignIdentity`, the `Groth16Verifier` (`Verifier.sol`), and `VerifierWrapper`. Then links the wrapper for batch size 5 inside the main contract, and attempts to write the new contract address into `../Gondor/manifests/config-local.yaml`.
*   **Check State (`scripts/check-state.ts`):** 
    Utility that queries the smart contract status for registered users. Run using:
    ```bash
    npx hardhat run scripts/check-state.ts --network localhost
    ```
*   **Expire Token (`scripts/expire-token.ts`):**
    Allows manual triggers of token expiration. If the heartbeat has timed out, the script calls `revokeExpiredReputation` to reset public reputation levels.
*   **Update Verifier (`scripts/update_verifier.ts`):**
    Deploys a new `VerifierWrapper` contract and registers it under the main SBT contract using `setVerifier`. Helpful if changing ZK circuit definitions.
