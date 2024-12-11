// /pages/api/create-payment.js
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const paymentData = {
      order_amount: 10.00, // Amount in INR
      order_currency: "INR",
      customer_details: {
        customer_id: "USER123",
        customer_name: "John Doe",
        customer_email: "customer@example.com",
        customer_phone: "1234567890",
      },
      order_meta: {
        return_url: "http://localhost:3001/payment/success", // Redirect URL after payment
      },
    };

    try {
      // Create Payment Session
      const response = await fetch('https://sandbox.cashfree.com/pg/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': process.env.CASHFREE_CLIENT_ID,
          'X-Client-Secret': process.env.CASHFREE_CLIENT_SECRET,
          'x-api-version': process.env.CASHFREE_API_VERSION,
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Cashfree API error:', data);
        return res.status(500).json({ error: 'Payment session creation failed', details: data });
      }

      // Log the session ID and order ID
      console.log('Payment Session ID:', data.payment_session_id);
      console.log('Order ID:', data.order_id);

      // Step 2: Create Virtual Account (Escrow)
      const virtualAccountData = {
        displayName: "John Doe Escrow Account", // Change the name as needed
        accountPrefix: "sandbox", // Use the account prefix you have from the bank
      };

      const virtualAccountResponse = await fetch('https://sandbox.cashfree.com/payout/fundsources/connected/virtual-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Id': process.env.CASHFREE_CLIENT_ID,
          'X-Client-Secret': process.env.CASHFREE_API_KEY,
          'x-api-version': process.env.CASHFREE_API_VERSION,
        },
        body: JSON.stringify(virtualAccountData),
      });

      const virtualAccountDataResponse = await virtualAccountResponse.json();

      if (!virtualAccountResponse.ok) {
        console.error('Virtual Account creation error:', virtualAccountDataResponse);
        return res.status(500).json({ error: 'Virtual Account creation failed', details: virtualAccountDataResponse });
      }

      console.log('Virtual Account Created:', virtualAccountDataResponse);

      res.status(200).json({
        payment_session_id: data.payment_session_id,
        order_id: data.order_id,
        virtual_account: virtualAccountDataResponse, // Return virtual account details
      });

    } catch (error) {
      console.error('Error creating payment session:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
}
