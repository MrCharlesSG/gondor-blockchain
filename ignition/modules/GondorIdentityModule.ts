import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GondorIdentityModule = buildModule("GondorIdentityModule", (m) => {
  const sbt = m.contract("GondorSovereignIdentity");

  return { sbt };
});

export default GondorIdentityModule;
