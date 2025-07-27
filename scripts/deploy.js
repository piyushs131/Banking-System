const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Contract = await hre.ethers.getContractFactory("TransactionValidator"); // Change if your contract name is different
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Contract deployed to:", address);
  // Print ABI for easy copy-paste
  console.log("ABI:", JSON.stringify(Contract.interface.format("json")));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
