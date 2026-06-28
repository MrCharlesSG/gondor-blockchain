import hre from "hardhat";

async function main() {
  console.log("Advancing local blockchain time to force expiration...");

  // Advance time by 31 days (in seconds)
  const daysToAdvance = 31;
  const secondsToAdvance = daysToAdvance * 24 * 60 * 60;
  
  await hre.network.provider.send("evm_increaseTime", [secondsToAdvance]);
  await hre.network.provider.send("evm_mine");

  console.log(`Successfully advanced EVM time by ${daysToAdvance} days!`);
  console.log("If you refresh the Expo app now (while the Go backend is stopped or before it injects a new heartbeat), you will see the EXPIRED red cross.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
