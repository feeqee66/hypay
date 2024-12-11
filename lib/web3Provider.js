import Web3 from 'web3';

// Set up the Web3 provider (replace with your network URL if needed)
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545'); // Use injected provider or local provider

// Contract ABI (simplified example)
const contractABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "transactionId", "type": "string" },
      { "name": "orderId", "type": "string" },
      { "name": "userName", "type": "string" },
      { "name": "amount", "type": "uint256" },
      { "name": "milestones", "type": "tuple[]", "components": [
        { "name": "description", "type": "string" },
        { "name": "amount", "type": "uint256" }
      ]}
    ],
    "name": "storeTransactionData",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Replace with your deployed contract address
const contractAddress = '0xYourSmartContractAddress';

// Initialize the contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Function to store transaction data in the contract
export const storeTransactionData = async ({ transactionId, orderId, userName, amount, milestones }) => {
  try {
    const accounts = await web3.eth.getAccounts(); // Get user's account
    const userAccount = accounts[0];

    const tx = await contract.methods.storeTransactionData(transactionId, orderId, userName, amount, milestones).send({
      from: userAccount
    });

    console.log('Transaction successful:', tx);
    return true;
  } catch (error) {
    console.error('Error storing transaction data:', error);
    return false;
  }
};
