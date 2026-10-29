const hre = require("hardhat");

async function main() {
  const EvidenceChain = await hre.ethers.getContractFactory("EvidenceChain");
  const evidenceChain = await EvidenceChain.deploy();
  
  await evidenceChain.waitForDeployment();

  console.log("CONTRACT_ADDRESS:", await evidenceChain.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});