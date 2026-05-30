# Walkthrough: SBT Implementation & Deployment

We have successfully implemented and deployed the Soulbound Token (SBT) for the Gondor project on the Polygon Amoy testnet.

## Changes Made

### 1. Hardhat Environment Stabilization
- Downgraded from Hardhat 3 Beta to the stable **Hardhat 2.28.6**.
- Restored the standard `@nomicfoundation/hardhat-toolbox` and configured **Solidity 0.8.24** with **Cancun EVM** support (required for OpenZeppelin v5).
- Removed ESM (`"type": "module"`) from `package.json` to improve compatibility with Hardhat plugins.

### 2. Smart Contract Cleanup
- Updated `ReputationSBT.sol` logic to ensure tokens are non-transferable (Soulbound) using OpenZeppelin's `_update` pattern.
- Translated all comments and error messages to English for better maintainability.

### 3. Testing & Validation
- Created a comprehensive test suite in `test/ReputationSBT.test.ts`.
- Verified 100% test passing, covering deployment, ownership, custom minting with DIDs, and the mandatory non-transferability property.

### 4. Deployment & Verification
- Created a Hardhat Ignition module for reproducible deployments.
- Deployed the contract to **Polygon Amoy**.
- Successfully verified the contract on **Polygonscan Amoy** and **Sourcify**.

## Deployment Details

- **Contract Address**: `0x5C301c88bfa00a91d4397BeEB9b601453864AF25`
- **Network**: Polygon Amoy (Chain ID: 80002)
- **Explorer Link**: [View on Polygonscan Amoy](https://amoy.polygonscan.com/address/0x5C301c88bfa00a91d4397BeEB9b601453864AF25#code)

> [!NOTE]
> The current deployment on-chain still contains the original Spanish comments/messages. The English cleanup performed locally will take effect in any future redeployments.

## Verification Result

![Verification Success](https://img.shields.io/badge/Polygonscan-Verified-green)
![Sourcify Success](https://img.shields.io/badge/Sourcify-Matched-blue)
