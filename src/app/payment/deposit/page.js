'use client';
import React from 'react';

const DepositPage = () => {
  const handleDeposit = async () => {
    try {
      const response = await fetch('/api/create-payment', { method: 'POST' });
      const data = await response.json();

      if (data.payment_session_id) {
        // Initialize Cashfree SDK with session ID
        const cashfree = window.Cashfree({
          mode: 'sandbox', // Change to 'production' for live transactions
        });

        // Open the checkout page
        cashfree.checkout({
          paymentSessionId: data.payment_session_id, // Pass session ID here
          redirectTarget: '_self',  // Same window or _blank for new window
        });

        // Optionally log for debugging
        console.log("Payment Session ID:", data.payment_session_id);
        console.log("Order ID:", data.order_id);
      } else {
        console.error('Payment Session creation failed:', data);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold mb-4">Deposit Money into Wallet</h1>
        <button onClick={handleDeposit} className="bg-blue-500 text-white p-2 rounded">
          Deposit Money
        </button>
      </div>
    </div>
  );
};

export default DepositPage;
