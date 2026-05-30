import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const configPath = path.resolve(__dirname, "../../Gondor/config-local.yaml");
  if (!fs.existsSync(configPath)) {
    console.error("config-local.yaml not found!");
    process.exit(1);
  }

  const configData = fs.readFileSync(configPath, "utf8");
  const match = configData.match(/contractAddress:\s*"(0x[a-fA-F0-9]{40})"/);
  if (!match) {
    console.error("contractAddress not found in config-local.yaml!");
    process.exit(1);
  }

  const contractAddress = match[1];
  console.log(`Using contract at: ${contractAddress}`);

  const sbt = await hre.ethers.getContractAt("GondorSovereignIdentity", contractAddress);

  for (let tokenId = 0; tokenId < 3; tokenId++) {
    try {
      const owner = await sbt.ownerOf(tokenId);
      const did = await sbt.tokenDIDs(tokenId);
      const repLevel = await sbt.reputationLevels(tokenId);
      const state = await sbt.identityStates(tokenId);
      const lastHeartbeat = await sbt.lastHeartbeat(tokenId);
      const reputationLevelsRealized = await sbt.reputationLevelsRealized(tokenId);

      // In Solidity, negative reputation levels were cast to uint256 using 2's complement
      // Let's decode it for display
      let repLevelNum = BigInt(repLevel);
      if (repLevelNum > BigInt("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")) {
        // It's negative
        const modulus = BigInt(1) << BigInt(256);
        repLevelNum = repLevelNum - modulus;
      }

      let repLevelRealizedNum = BigInt(reputationLevelsRealized);
      if (repLevelRealizedNum > BigInt("0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")) {
        // It's negative
        const modulus = BigInt(1) << BigInt(256);
        repLevelRealizedNum = repLevelRealizedNum - modulus;
      }

      console.log(`\n--- TOKEN ID: ${tokenId} ---`);
      console.log(`Owner:         ${owner}`);
      console.log(`DID:           ${did}`);
      console.log(`Rep Level:     ${repLevelNum.toString()}%`);
      console.log(`Rep Level Realized:     ${repLevelRealizedNum.toString()}%`);
      console.log(`Total Revenue: ${state.totalRevenue.toString()}`);
      console.log(`Total Cost:    ${state.totalCost.toString()}`);
      console.log(`Cost Realized: ${state.totalCostRealized.toString()}`);
      console.log(`Last Heartbt:  ${new Date(Number(lastHeartbeat) * 1000).toLocaleString()}`);
    } catch (e: any) {
      if (e.message.includes("Non-existent token")) {
        console.log(`\n--- TOKEN ID: ${tokenId} ---`);
        console.log(`Does not exist yet.`);
      } else {
        console.log(`\n--- TOKEN ID: ${tokenId} ---`);
        console.log(`Error fetching: ${e.message}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
