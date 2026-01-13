const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying CertificateRegistry contract...");

  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const certificateRegistry = await CertificateRegistry.deploy();

  await certificateRegistry.waitForDeployment();

  const address = await certificateRegistry.getAddress();
  console.log(`CertificateRegistry deployed to: ${address}`);

  // Save the contract address to a file for the frontend
  const contractsDir = path.join(__dirname, "..", "deployments");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ CertificateRegistry: address }, undefined, 2)
  );

  console.log("Contract address saved to deployments/contract-address.json");

  // Save the contract ABI
  const artifact = await hre.artifacts.readArtifact("CertificateRegistry");
  
  fs.writeFileSync(
    path.join(contractsDir, "CertificateRegistry.json"),
    JSON.stringify(artifact, null, 2)
  );

  console.log("Contract ABI saved to deployments/CertificateRegistry.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
