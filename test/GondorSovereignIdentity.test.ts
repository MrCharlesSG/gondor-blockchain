import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("GondorSovereignIdentity", function () {
  // Define a fixture to reuse the deployment cleanly in each test
  async function deploySBTFixture() {
    const [owner, otherAccount, stranger] = await hre.ethers.getSigners();

    const GondorSovereignIdentity = await hre.ethers.getContractFactory("GondorSovereignIdentity");
    const sbt = await GondorSovereignIdentity.deploy();

    return { sbt, owner, otherAccount, stranger };
  }

  describe("Deployment", function () {
    it("Should have the correct name and symbol", async function () {
      const { sbt } = await loadFixture(deploySBTFixture);
      expect(await sbt.name()).to.equal("GondorSovereignIdentity");
      expect(await sbt.symbol()).to.equal("GSID");
    });

    it("The deployer should be the owner", async function () {
      const { sbt, owner } = await loadFixture(deploySBTFixture);
      expect(await sbt.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Allows the owner to mint an SBT, returns tokenId and initializes fields", async function () {
      const { sbt, otherAccount } = await loadFixture(deploySBTFixture);
      const did = "did:gondor:123cad-456";

      // Verify return value using staticCall
      const returnedTokenId = await sbt.safeMint.staticCall(otherAccount.address, did);
      expect(returnedTokenId).to.equal(0);

      // Execute actual transaction
      await expect(sbt.safeMint(otherAccount.address, did))
        .to.emit(sbt, "Transfer")
        .withArgs(hre.ethers.ZeroAddress, otherAccount.address, 0);

      expect(await sbt.ownerOf(0)).to.equal(otherAccount.address);
      expect(await sbt.tokenDIDs(0)).to.equal(did);

      // Verify initial reputation level and heartbeat
      expect(await sbt.reputationLevels(0)).to.equal(1);
      expect(await sbt.lastHeartbeat(0)).to.be.gt(0);
    });

    it("Fails if a non-owner tries to mint", async function () {
      const { sbt, otherAccount, stranger } = await loadFixture(deploySBTFixture);
      const did = "did:gondor:fake";

      await expect(sbt.connect(stranger).safeMint(otherAccount.address, did))
        .to.be.revertedWithCustomError(sbt, "OwnableUnauthorizedAccount")
        .withArgs(stranger.address);
    });
  });

  describe("Reputation Management (Pelargir II)", function () {
    it("Allows the owner to anchor Merkle roots", async function () {
      const { sbt } = await loadFixture(deploySBTFixture);
      const root = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("batch-123"));

      await expect(sbt.anchorRoot(root))
        .to.emit(sbt, "RootAnchored")
        .withArgs(root);

      expect(await sbt.canonicalRoots(root)).to.equal(true);
    });

    it("Allows the owner to update reputation with a proof and emits an event", async function () {
      const { sbt, otherAccount } = await loadFixture(deploySBTFixture);
      await sbt.safeMint(otherAccount.address, "did:gondor:test");

      // Deploy Mock Verifier
      const MockVerifier = await hre.ethers.getContractFactory("MockVerifier");
      const verifier = await MockVerifier.deploy();

      // Register verifier for batch size 1
      await sbt.setVerifier(1, verifier.target);

      const proof = "0x1234"; // Mock proof
      const dummyRoots = [hre.ethers.ZeroHash];
      await expect(sbt.updateReputationWithProof(0, 5, 1000, 500, dummyRoots, proof))
        .to.emit(sbt, "ReputationUpdated")
        .withArgs(0, 5);

      expect(await sbt.reputationLevels(0)).to.equal(5);

      const state = await sbt.identityStates(0);
      expect(state.totalRevenue).to.equal(1000);
      expect(state.totalCost).to.equal(500);
    });
  });

  describe("External Verifier Integration", function () {
    it("Should allow the owner to set the verifier address for a batch size", async function () {
      const { sbt, otherAccount } = await loadFixture(deploySBTFixture);
      const mockVerifierAddr = otherAccount.address;

      await expect(sbt.setVerifier(5, mockVerifierAddr))
        .to.emit(sbt, "VerifierSet")
        .withArgs(5, mockVerifierAddr);

      expect(await sbt.verifiers(5)).to.equal(mockVerifierAddr);
    });

    it("Should fail if a non-owner tries to set the verifier", async function () {
      const { sbt, stranger } = await loadFixture(deploySBTFixture);
      await expect(sbt.connect(stranger).setVerifier(5, stranger.address))
        .to.be.revertedWithCustomError(sbt, "OwnableUnauthorizedAccount")
        .withArgs(stranger.address);
    });

    it("Should validate proofs using the external verifier when set", async function () {
      const { sbt, otherAccount } = await loadFixture(deploySBTFixture);

      // 1. Deploy Mock Verifier
      const MockVerifier = await hre.ethers.getContractFactory("MockVerifier");
      const verifier = await MockVerifier.deploy();

      const root = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("valid-batch"));
      await sbt.anchorRoot(root);

      // 2. Set verifier in SBT contract for batch size 1
      await sbt.setVerifier(1, verifier.target);

      // 3. Mint and try to update reputation
      await sbt.safeMint(otherAccount.address, "did:gondor:test");

      // Test success
      await verifier.setNextResult(true);
      await expect(sbt.updateReputationWithProof(0, 10, 2000, 1000, [root], "0xabc123"))
        .to.emit(sbt, "ReputationUpdated")
        .withArgs(0, 10);

      // Test failure (Invalid Proof)
      await verifier.setNextResult(false);
      await expect(sbt.updateReputationWithProof(0, 20, 3000, 1500, [root], "0xbad0"))
        .to.be.revertedWith("Gondor: Invalid ZK proof");

      // Test failure (Root not anchored)
      const fakeRoot = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("fake-batch"));
      await expect(sbt.updateReputationWithProof(0, 30, 4000, 2000, [fakeRoot], "0x1234"))
        .to.be.revertedWith("Gondor: A root is not anchored");
    });
  });

  describe("Sovereign Handover (Custodial -> Personal)", function () {
    it("Allows the owner to handover identity to a new wallet", async function () {
      const { sbt, otherAccount, stranger } = await loadFixture(deploySBTFixture);

      // 1. Mint to custodial wallet (otherAccount)
      await sbt.safeMint(otherAccount.address, "did:gondor:custodial");
      expect(await sbt.ownerOf(0)).to.equal(otherAccount.address);

      // 2. Handover to personal wallet (stranger)
      await expect(sbt.handoverSovereignty(0, stranger.address))
        .to.emit(sbt, "IdentityHandedOver")
        .withArgs(0, otherAccount.address, stranger.address);

      expect(await sbt.ownerOf(0)).to.equal(stranger.address);
    });

    it("Fails if a user tries to transfer their own identity (even after handover)", async function () {
      const { sbt, stranger, owner } = await loadFixture(deploySBTFixture);

      // 1. Handover to stranger
      await sbt.safeMint(owner.address, "did:gondor:test");
      await sbt.handoverSovereignty(0, stranger.address);

      // 2. Stranger attempts to transfer to another account
      await expect(
        sbt.connect(stranger).transferFrom(stranger.address, owner.address, 0)
      ).to.be.revertedWith("Gondor: SBT is non-transferable");
    });
  });

  describe("Soulbound Property (Non-transferability)", function () {
    it("Should NOT allow transfers between users", async function () {
      const { sbt, otherAccount, stranger } = await loadFixture(deploySBTFixture);
      const did = "did:gondor:soulbound-item";

      // Mint a token to otherAccount
      await sbt.safeMint(otherAccount.address, did);

      // Attempt to transfer from otherAccount to stranger
      await expect(
        sbt.connect(otherAccount).transferFrom(otherAccount.address, stranger.address, 0)
      ).to.be.revertedWith("Gondor: SBT is non-transferable");
    });
  });
});
