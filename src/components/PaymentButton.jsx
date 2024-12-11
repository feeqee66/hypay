// src/app/components/PaymentButton.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import HybridEscrow from '../contracts/HybridEscrow.json'; // Import ABI

const PaymentButton = ({ method, onClick }) => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState(0);

  // Initialize MetaMask connection
  useEffect(() => {
    if (window.ethereum) {
      try {
        const ethereumProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethereumProvider);

        // Request user account connection to MetaMask
        window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts) => {
          setAccount(accounts[0]);
        }).catch((error) => {
          console.error('Error connecting to MetaMask:', error);
        });
      } catch (error) {
        console.error('Error initializing Web3Provider:', error);
      }
    } else {
      alert('MetaMask is required for this feature.');
    }
  }, []);

  useEffect(() => {
    if (provider) {
      // Fetch the contract after provider is set
      const loadContract = async () => {
        try {
          const signer = provider.getSigner();
          const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Use the contract address
          const contractInstance = new ethers.Contract(contractAddress, HybridEscrow.abi, signer);
          setContract(contractInstance);
        } catch (error) {
          console.error('Error loading contract:', error);
        }
      };
      loadContract();
    }
  }, [provider]);

  // Handle the payment logic
  const handlePayment = async () => {
    if (!contract || !amount || isNaN(amount)) {
      alert('Please enter a valid amount.');
      return;
    }
    try {
      // Trigger payment
      const tx = await contract.deposit(amount, { value: ethers.utils.parseEther(amount.toString()) });
      await tx.wait();  // Wait for the transaction to be mined
      alert('Payment successful!');
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed!');
    }
  };

  return (
    <div>
      <h3>Payment Method: {method}</h3>
      <p>Connected Account: {account}</p>
      <input
        type="number"
        placeholder="Enter amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 border"
      />
      <button onClick={handlePayment} className="bg-blue-500 text-white p-2 rounded">
        Pay with {method}
      </button>
    </div>
  );
};

export default PaymentButton;
