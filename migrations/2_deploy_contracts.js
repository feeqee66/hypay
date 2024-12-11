const Escrow = artifacts.require("Escrow");

module.exports = async function(deployer, network, accounts) {
  // Deploy the contract without any constructor arguments, as the Escrow contract doesn't require them
  await deployer.deploy(Escrow);

  console.log('Escrow contract deployed at address:', Escrow.address);
};
