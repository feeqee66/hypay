'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';

const PaymentSuccessPage = () => {
  const router = useRouter();
  const [milestones, setMilestones] = useState([]);
  const [contractBalance, setContractBalance] = useState(0);
  const [newMilestone, setNewMilestone] = useState('');
  const [newMilestoneAmount, setNewMilestoneAmount] = useState('');
  const [error, setError] = useState(null);

  const [transactionDetails, setTransactionDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('LOADING');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const contractAddress = "0x91e9cccce27d9da2da2142d29f3ed1420465f525"; // Replace with your contract address
  const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "MilestoneLimitExceeded",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "transactionId",
          "type": "bytes32"
        },
        {
          "internalType": "uint96",
          "name": "amount",
          "type": "uint96"
        },
        {
          "internalType": "bytes32",
          "name": "userName",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "orderId",
          "type": "bytes32"
        },
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "description",
              "type": "bytes32"
            },
            {
              "internalType": "uint96",
              "name": "amount",
              "type": "uint96"
            }
          ],
          "internalType": "struct OptimizedEscrow.Milestone[]",
          "name": "milestoneData",
          "type": "tuple[]"
        }
      ],
      "name": "storeAllDetails",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "Unauthorized",
      "type": "error"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    },
    {
      "inputs": [],
      "name": "getContractBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMilestones",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "description",
              "type": "bytes32"
            },
            {
              "internalType": "uint96",
              "name": "amount",
              "type": "uint96"
            }
          ],
          "internalType": "struct OptimizedEscrow.Milestone[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getPaymentDetails",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "transactionId",
          "type": "bytes32"
        },
        {
          "internalType": "uint96",
          "name": "amount",
          "type": "uint96"
        },
        {
          "internalType": "bytes32",
          "name": "userName",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "orderId",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]; // Add your contract ABI here

  useEffect(() => {
    const initEthers = async () => {
      if (window.ethereum) {
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethersProvider);

        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const ethersSigner = ethersProvider.getSigner();
        setSigner(ethersSigner);

        const escrowContract = new ethers.Contract(contractAddress, contractABI, ethersSigner);
        setContract(escrowContract);
      } else {
        console.error("Ethereum wallet not found!");
      }
    };

    initEthers();

    const fetchTransactionDetails = async () => {
      try {
        const res = await fetch('/api/webhook', { method: 'GET' });
        const data = await res.json();
        if (data?.data?.payment?.payment_status === 'SUCCESS') {
          setTransactionDetails(data);
          const paymentAmount = parseFloat(data.data.payment.payment_amount);
          setContractBalance(paymentAmount);
          setPaymentStatus('SUCCESS');
        } else {
          setPaymentStatus('FAILURE');
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        setPaymentStatus('FAILURE');
      }
    };

    fetchTransactionDetails();
  }, []);

  const validateStringLength = (str) => {
    return str.length > 31 ? str.slice(0, 31) : str;
  };

  const handleAddMilestone = () => {
    if (!newMilestone || !newMilestoneAmount) {
      setError('Please provide a description and a valid amount for the milestone.');
      return;
    }

    const amount = parseFloat(newMilestoneAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Milestone amount must be a positive number.');
      return;
    }

    setMilestones([...milestones, { description: newMilestone, amount }]);
    setNewMilestone('');
    setNewMilestoneAmount('');
    setError(null);
  };

  const handleReleaseMilestone = (index) => {
    const milestone = milestones[index];
    if (!milestone) {
      alert("Milestone not found.");
      return;
    }

    if (milestone.amount > contractBalance) {
      alert("Insufficient contract balance to release this milestone.");
      return;
    }

    setContractBalance((prevBalance) => prevBalance - milestone.amount);

    setMilestones((prevMilestones) =>
      prevMilestones.filter((_, i) => i !== index)
    );

    alert(`Milestone "${milestone.description}" of ₹${milestone.amount.toFixed(2)} released successfully!`);
  };

  const storeInSmartContract = async () => {
    if (contract && signer && transactionDetails) {
      const cf_payment_id = transactionDetails?.data?.payment?.cf_payment_id || "N/A";
      const payment_amount = transactionDetails?.data?.payment?.payment_amount || "N/A";
      const customer_name = transactionDetails?.data?.customer_details?.customer_name || "N/A";
      const order_id = transactionDetails?.data?.order?.order_id || "N/A";

      try {
        const transactionIdBytes32 = ethers.utils.formatBytes32String(validateStringLength(cf_payment_id));
        const userNameBytes32 = ethers.utils.formatBytes32String(validateStringLength(customer_name));
        const orderIdBytes32 = ethers.utils.formatBytes32String(validateStringLength(order_id));
        const amount = ethers.utils.parseUnits(payment_amount.toString(), 18); // Ensure payment_amount is a string

        const milestoneData = milestones.map((milestone) => ({
          description: ethers.utils.formatBytes32String(validateStringLength(milestone.description)),
          amount: ethers.utils.parseUnits(milestone.amount.toString(), 18)
        }));

        const tx = await contract.storeAllDetails(
          transactionIdBytes32,
          amount,
          userNameBytes32,
          orderIdBytes32,
          milestoneData
        );

        await tx.wait();

        alert("Details stored in the smart contract!");
      } catch (error) {
        console.error("Error storing in smart contract:", error);
        alert("Error occurred while storing data in the smart contract.");
      }
    } else {
      alert("Smart contract or account is not available.");
    }
  };

  if (paymentStatus === 'LOADING') {
    return <p>Loading transaction details...</p>;
  }

  if (paymentStatus === 'FAILURE') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center bg-white shadow-lg p-6 rounded-lg">
          <h1 className="text-4xl font-semibold mb-6 text-red-800">Payment Failed</h1>
          <p className="text-lg text-gray-600">We couldn't process your payment. Please try again.</p>
          <button
            onClick={() => router.push('/payment')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="space-y-6 text-center bg-white shadow-lg p-6 rounded-lg">
        <h1 className="text-4xl font-semibold mb-6 text-gray-800">Payment Successful</h1>
        <p className="text-lg text-gray-600">Customize and release milestones below.</p>

        {transactionDetails ? (
          <div className="text-lg font-semibold text-gray-700 mb-4">
            <p>Transaction ID: {transactionDetails?.data?.payment?.cf_payment_id || 'N/A'}</p>
            <p>Amount: ₹{transactionDetails?.data?.payment?.payment_amount || 'N/A'}</p>
            <p>User Name: {transactionDetails?.data?.customer_details?.customer_name || 'N/A'}</p>
            <p>Order ID: {transactionDetails?.data?.order?.order_id || 'N/A'}</p>
          </div>
        ) : (
          <p className="text-gray-500">Loading transaction details...</p>
        )}

        <div className="text-xl font-bold text-blue-600">Contract Balance: ₹{contractBalance.toFixed(2)}</div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Milestone Description"
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Milestone Amount (₹)"
            value={newMilestoneAmount}
            onChange={(e) => setNewMilestoneAmount(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleAddMilestone}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
          >
            Add Milestone
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Milestones</h2>
          {milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded shadow">
                <div>
                  <p className="text-lg font-medium">{milestone.description}</p>
                  <p className="text-sm text-gray-500">Amount: ₹{milestone.amount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleReleaseMilestone(index)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                >
                  Release
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No milestones added yet.</p>
          )}
        </div>

        <button
          onClick={storeInSmartContract}
          className="bg-purple-500 text-white px-6 py-2 rounded-full shadow hover:bg-purple-600 transition duration-300"
        >
          Store in Smart Contract
        </button>

        <button
          onClick={() => router.push('/payment')}
          className="bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition duration-300"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
