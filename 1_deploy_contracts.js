
const Escrow = artifacts.require("Escrow");

module.exports = async function (deployer, network, accounts) {
  // Specify the farmer's address explicitly
  const farmerAddress = "0x58099a21293569e39178A02e3Ff4B727eD2038A6"; // Replace with the actual farmer's address

  // Deploy the Escrow contract with the farmer's address
  await deployer.deploy(Escrow, farmerAddress);

  // Get the deployed contract instance
  const escrowInstance = await Escrow.deployed();

  // Log the deployed contract address and farmer address
  console.log("Escrow contract deployed at:", escrowInstance.address);
  console.log("Farmer address set to:", farmerAddress);

  // You can optionally add more actions here if needed, such as verifying or interacting with the contract after deployment
};









