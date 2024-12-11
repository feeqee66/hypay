// src/app/payment/card/page.js
'use client';
import React, { useState } from 'react';

const CardPage = () => {
  const [amount, setAmount] = useState(0);

  const handlePayment = () => {
    console.log(`Initiating Card/Netbanking payment for ${amount}`);
    // Add Razorpay or card payment logic here
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold mb-4">Card/Netbanking Payment Setup</h1>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border"
        />
        <button onClick={handlePayment} className="bg-blue-500 text-white p-2 rounded">
          Proceed with Card Payment
        </button>
      </div>
    </div>
  );
};

export default CardPage;
