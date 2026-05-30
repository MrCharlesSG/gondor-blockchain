import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Deployer Address:", signer.address);
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Current Balance:", ethers.formatEther(balance), "MATIC");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
