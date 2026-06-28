import hre from "hardhat";

async function main() {
  console.log("Starting the deployment of the Sovereign Identity (SBT) on Polygon Amoy...");

  // Use hre.ethers instead of importing ethers directly
  const sbt = await hre.ethers.deployContract("GondorSovereignIdentity");

  // Wait for the Polygon network to confirm the transaction
  await sbt.waitForDeployment();

  // Get the final contract address
  const address = sbt.target;
  console.log(`<br>Success! GondorSovereignIdentity contract deployed at address: ${address}`);

  console.log("Deploying ZK Verifier...");
  const verifier = await hre.ethers.deployContract("Groth16Verifier");
  await verifier.waitForDeployment();
  const verifierAddress = verifier.target;
  console.log(`Success! Verifier deployed at address: ${verifierAddress}`);

  console.log("Deploying VerifierWrapper...");
  const wrapper = await hre.ethers.deployContract("VerifierWrapper", [verifierAddress]);
  await wrapper.waitForDeployment();
  const wrapperAddress = wrapper.target;
  console.log(`Success! VerifierWrapper deployed at address: ${wrapperAddress}`);

  console.log("Linking VerifierWrapper to GondorSovereignIdentity...");
  const tx = await sbt.setVerifier(5, wrapperAddress);
  await tx.wait();
  console.log("Success! Contracts linked and ready.");

  // Automatically update config-local.yaml
  const fs = require("fs");
  const path = require("path");
  const configPath = path.resolve(__dirname, "../../Gondor/config-local.yaml");
  if (fs.existsSync(configPath)) {
    let configData = fs.readFileSync(configPath, "utf8");
    configData = configData.replace(/contractAddress:\s*".*"/, `contractAddress: "${sbt.target}"`);
    fs.writeFileSync(configPath, configData);
    console.log(`Updated config-local.yaml with new contractAddress: ${sbt.target}`);
  }
}

// Standard pattern to handle asynchronous errors
main().catch((error) => {
  console.error("Error during deployment:", error);
  process.exitCode = 1;
});