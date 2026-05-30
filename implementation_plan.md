# Implementation Plan: Gondor Verifiable Identity (Pelargir II)

This plan evolves the Gondor Identity from a simple token into a **Sovereign, Verifiable Identity** that supports the TFM requirements: backend-managed onboarding, custodial-to-sovereign handover, and ZK-verified reputation.

## User Review Required

> [!IMPORTANT]
> **Identity Sovereignty (Handover)**: I am adding `handoverSovereignty`. This is the ONLY way an SBT can move. It allows your backend to transfer a user's ID from your managed wallet to their personal MetaMask. 

> [!NOTE]
> **Independent Verification**: By adding `anchorRoot`, we allow anyone to verify that the reputation updates are backed by the platform's canonical history without needing to access your private database.

## Proposed Changes

### 1. Smart Contract Update

#### [MODIFY] [GondorSovereignIdentity.sol](file:///c:/Users/cserr/source/repos/gondor-blockchain/contracts/GondorSovereignIdentity.sol)
- **Merkle Root Anchoring**:
  - `mapping(bytes32 => bool) public canonicalRoots`: Stores established batch roots.
  - `function anchorRoot(bytes32 root)`: OnlyOwner. Allows Pelargir to notarize transaction batches.
- **Sovereign Handover**:
  - `function handoverSovereignty(uint256 tokenId, address newOwner)`: OnlyOwner. Allows migrating an identity from a managed wallet to a personal wallet.
- **Verifiable Reputation**:
  - `function updateReputationWithProof(uint256 tokenId, uint256 newLevel, bytes calldata proof)`: Placeholder for ZK-SNARK verification.
  - `event ReputationUpdated(uint256 indexed tokenId, uint256 newLevel)`: Provides the public audit trail.

### 2. Infrastructure & Tests

#### [MODIFY] [GondorSovereignIdentity.test.ts](file:///c:/Users/cserr/source/repos/gondor-blockchain/test/GondorSovereignIdentity.test.ts)
- **Lifecycle Tests**:
  - Test minting a "Managed Identity".
  - Test the **Handover** process and verify the user now holds their own ID.
  - Test **Root Anchoring** and verify reputation updates are emitted correctly.
  - Verify that even a "Sovereign Holder" cannot modify their own reputation level.

## Verification Plan

### Automated Tests
- `npx hardhat test` to confirm:
  - Non-transferability (except through Handover).
  - Secure Ownership (Only backend can call state-changing functions).
  - Proper event emission for auditing.
