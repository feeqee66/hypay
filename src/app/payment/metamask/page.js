'use client';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import Escrow from '../../../contracts/Escrow.json';
import Link from 'next/link'; // Import Link for navigation

const CONTRACT_ADDRESS = '0xeaa558644c6e21159042353b3f5e558abccb7ea7'; // Replace this
const FARMER_ADDRESS = '0x10b29aE1c9Adf8b706A2f3Eb63c3F17db714Eca3'; // Replace this

const MetaMaskPage = () => {
  const [amount, setAmount] = useState('');
  const [milestoneAmount, setMilestoneAmount] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [contractBalance, setContractBalance] = useState('');
  const [milestones, setMilestones] = useState([]);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setIsConnected(true);
        console.log('Connected account:', accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error.message);
      }
    } else {
      alert('MetaMask not detected! Please install MetaMask.');
    }
  };

  // Deposit full amount to the contract
  const depositToContract = async () => {
    if (!isConnected) {
      alert('Please connect to MetaMask first.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Enter a valid amount in ETH.');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const escrowContract = new ethers.Contract(CONTRACT_ADDRESS, Escrow.abi, signer);

      const tx = await escrowContract.deposit({
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      alert('Deposit successful!');
      fetchContractBalance();
    } catch (error) {
      console.error('Deposit error:', error.message);
      alert('Deposit failed.');
    }
  };

  // Add milestone with amount and description
  const addMilestone = async () => {
    if (!milestoneAmount || parseFloat(milestoneAmount) <= 0) {
      alert('Enter a valid milestone amount.');
      return;
    }

    if (!milestoneDescription) {
      alert('Enter a description for the milestone.');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const escrowContract = new ethers.Contract(CONTRACT_ADDRESS, Escrow.abi, signer);

      // Estimate gas for addMilestone
      const gasEstimate = await escrowContract.estimateGas.addMilestone(ethers.utils.parseEther(milestoneAmount));
      console.log('Gas estimate for addMilestone:', gasEstimate.toString());

      const tx = await escrowContract.addMilestone(ethers.utils.parseEther(milestoneAmount), {
        gasLimit: gasEstimate.toString(),
      });
      await tx.wait();
      alert('Milestone added!');
      fetchMilestones();
    } catch (error) {
      console.error('Add milestone error:', error);
      alert('Failed to add milestone. Please check the console for more details.');
    }
  };

  // Release payment for a milestone
  const releasePayment = async (index) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const escrowContract = new ethers.Contract(CONTRACT_ADDRESS, Escrow.abi, signer);

      const tx = await escrowContract.releasePayment(index);
      await tx.wait();
      alert('Payment for milestone released!');
      fetchContractBalance();
      fetchMilestones();
    } catch (error) {
      console.error('Release payment error:', error.message);
      alert('Failed to release payment.');
    }
  };

  // Fetch contract balance
  const fetchContractBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const escrowContract = new ethers.Contract(CONTRACT_ADDRESS, Escrow.abi, provider);

      const balance = await escrowContract.getContractBalance();
      setContractBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Fetch balance error:', error.message);
    }
  };

  // Fetch all milestones
  const fetchMilestones = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const escrowContract = new ethers.Contract(CONTRACT_ADDRESS, Escrow.abi, provider);

      const milestoneCount = await escrowContract.getMilestoneCount();
      const milestoneData = [];
      for (let i = 0; i < milestoneCount; i++) {
        const milestone = await escrowContract.getMilestone(i);
        milestoneData.push(milestone);
      }
      setMilestones(milestoneData);
    } catch (error) {
      console.error('Fetch milestones error:', error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-explore bg-center bg-cover bg-repeat">
  <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
    <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Escrow System</h1>
    
    <button 
      onClick={connectWallet} 
      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 mb-6"
    >
      Connect Wallet
    </button>
    
    {isConnected && (
      <p className="text-center text-gray-700 font-medium mb-4">
        Connected Account: <span className="font-semibold">{account}</span>
      </p>
    )}
    
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Enter full amount to deposit in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 border rounded-lg text-gray-700"
      />
      <button 
        onClick={depositToContract} 
        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-300"
      >
        Deposit Full Amount
      </button>

      <input
        type="text"
        placeholder="Enter milestone amount in ETH"
        value={milestoneAmount}
        onChange={(e) => setMilestoneAmount(e.target.value)}
        className="w-full p-3 border rounded-lg text-gray-700"
      />
      <input
        type="text"
        placeholder="Enter milestone description"
        value={milestoneDescription}
        onChange={(e) => setMilestoneDescription(e.target.value)}
        className="w-full p-3 border rounded-lg text-gray-700"
      />
      <button 
        onClick={addMilestone} 
        className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
      >
        Add Milestone
      </button>
    </div>
    
    {milestones.length > 0 && (
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-800">Milestones</h2>
        <ul className="space-y-4 mt-4">
          {milestones.map((milestone, index) => (
            <li 
              key={index} 
              className="p-4 border rounded-lg bg-gray-100 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  Milestone {index + 1}: {ethers.utils.formatEther(milestone.amount)} ETH
                </p>
                <p className="text-sm text-gray-600">{milestone.description}</p>
              </div>
              {!milestone.released && (
                <button
                  onClick={() => releasePayment(index)}
                  className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-300"
                >
                  Release Payment
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}

    <p className="mt-6 text-gray-700 font-medium">
      Contract Balance: <span className="font-bold">{contractBalance} ETH</span>
    </p>

    <Link href="/payment">
      <button 
        className="w-full mt-6 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition duration-300"
      >
        Back to Home
      </button>
    </Link>
  </div>
</div>
  );
};

export default MetaMaskPage;