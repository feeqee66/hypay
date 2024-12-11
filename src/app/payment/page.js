'use client';
import React from 'react';
import { useRouter } from 'next/navigation'; // For Next.js 13+ use navigation from next

const PaymentPage = () => {
  const router = useRouter();

  const handleRedirect = (method) => {
    // Redirect based on payment method selected
    if (method === "MetaMask") {
      router.push('/payment/metamask'); // Redirect to MetaMask payment page
    } else if (method === "Card/Netbanking") {
      router.push('/payment/deposit'); // Redirect to deposit page for Card/Netbanking
    }
  };

  return (
            <div 
        className="flex justify-center items-center min-h-screen bg-explore bg-cover bg-center bg-no-repeat">
        <div className="bg-white/90 shadow-xl rounded-lg p-8 max-w-md w-full space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
            Choose Your Payment Method
            </h1>
            <p className="text-gray-700 text-center">
            Select a payment method to complete your transaction securely.
            </p>
            {/* Pay with MetaMask Button */}
            <div className='flex justify-center items-center'>
            <button
            onClick={() => handleRedirect("MetaMask")}
            className="w-1/2 mr-8 bg-yellow-400 text-black py-3 rounded-2xl shadow-lg hover:text-white hover:bg-yellow-600 transition ease-in-out duration-300"
            >
            Pay with MetaMask
            </button>
            {/* Pay with Card/Netbanking Button */}
            <button
            onClick={() => handleRedirect("Card/Netbanking")}
            className="w-1/2 bg-blue-400 text-black py-3 rounded-2xl shadow-lg hover:text-white hover:bg-blue-600 transition ease-in-out duration-300"
            >
            Pay with Card/Netbanking/UPI
            </button>
            </div>
        </div>
        </div>

  );
};

export default PaymentPage;