'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const MetaMaskPage = () => {
  const [amount, setAmount] = useState(0);
  const [milestoneAmount, setMilestoneAmount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const contractAddress = "0x66C868170A9f07AD27050F541A6d12bB419B271e";
  const contractABI = [{
    "inputs": [
      {
        "internalType": "address",
        "name": "_farmer",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "buyer",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "farmer",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "milestones",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "enum HybridEscrow.MilestoneStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "dueDate",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_dueDate",
        "type": "uint256"
      }
    ],
    "name": "addMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "confirmMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_index",
        "type": "uint256"
      }
    ],
    "name": "releasePayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }];

  useEffect(() => {
    const init = async () => {
      const _provider = new ethers.providers.Web3Provider(window.ethereum);
      const _signer = _provider.getSigner();
      const _contract = new ethers.Contract(contractAddress, contractABI, _signer);
      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);
    };
    init();
  }, []);

  const handlePayment = async () => {
    if (!amount || isNaN(amount) || amount <= 0) return;

    setLoading(true);
    try {
      const amountInEther = ethers.utils.parseEther(amount.toString());
      const tx = await contract.deposit(amountInEther, { value: amountInEther });
      await tx.wait();
      console.log('Payment successful:', tx);
      alert('Deposit successful!');
    } catch (err) {
      console.error('Payment failed:', err);
      alert(`Payment failed! Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleAddMilestone = async () => {
    if (!milestoneAmount || !dueDate || isNaN(milestoneAmount) || milestoneAmount <= 0) return;

    const dueTimestamp = new Date(dueDate).getTime() / 1000;
    try {
      setLoading(true);
      const tx = await contract.addMilestone(ethers.utils.parseEther(milestoneAmount), dueTimestamp);
      await tx.wait();
      console.log('Milestone added successfully:', tx);
      fetchMilestones(contract);
      alert('Milestone added successfully!');
    } catch (err) {
      console.error('Error adding milestone:', err);
      alert(`Error adding milestone! Error: ${err.message}`);
    }
    setLoading(false);
  };

  const fetchMilestones = async (contract) => {
    const totalMilestones = await contract.milestones.length;
    let milestonesArray = [];
    for (let i = 0; i < totalMilestones; i++) {
      const milestone = await contract.milestones(i);
      milestonesArray.push({
        amount: ethers.utils.formatEther(milestone.amount),
        status: milestone.status,
        dueDate: new Date(milestone.dueDate * 1000).toLocaleDateString(),
      });
    }
    setMilestones(milestonesArray);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold mb-4">MetaMask Payment Setup</h1>

        {/* Deposit Section */}
        <div>
          <input
            type="number"
            placeholder="Enter amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 border"
          />
          <button onClick={handlePayment} className="bg-blue-500 text-white p-2 rounded">
            {loading ? 'Processing Payment...' : 'Proceed with Deposit Payment'}
          </button>
        </div>

        {/* Milestone Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold">Add Milestone</h2>
          <input
            type="number"
            placeholder="Enter milestone amount in ETH"
            value={milestoneAmount}
            onChange={(e) => setMilestoneAmount(e.target.value)}
            className="p-2 border"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-2 border"
          />
          <button
            onClick={handleAddMilestone}
            className="bg-green-500 text-white p-2 rounded"
            disabled={loading || !milestoneAmount || !dueDate}
          >
            {loading ? 'Adding Milestone...' : 'Add Milestone'}
          </button>
        </div>

        {/* Display Milestones */}
        <div>
          <h2 className="text-xl font-semibold mt-6">Milestones</h2>
          {milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <div key={index} className="border-b py-2">
                <p><strong>Amount:</strong> {milestone.amount} ETH</p>
                <p><strong>Due Date:</strong> {milestone.dueDate}</p>
                <p><strong>Status:</strong> {milestone.status === 0 ? 'Not Set' : milestone.status === 1 ? 'In Progress' : 'Completed'}</p>
              </div>
            ))
          ) : (
            <p>No milestones set yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaMaskPage;
