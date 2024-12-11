// /pages/api/verify-payment.js
export default async function handler(req, res) {
    const { payment_session_id, order_id } = req.query;
  
    if (!payment_session_id || !order_id) {
      return res.status(400).json({ error: 'Missing payment session or order ID' });
    }
  
    try {
      // Make an API call to Cashfree's verification endpoint or your internal logic
      // Use the payment_session_id and order_id to verify the payment
  
      // Mock response for now, replace with actual API call to Cashfree
      const paymentVerificationResponse = {
        status: 'SUCCESS', // Replace with actual status from Cashfree API
        message: 'Payment verified successfully',
      };
  
      if (paymentVerificationResponse.status === 'SUCCESS') {
        res.status(200).json(paymentVerificationResponse);
      } else {
        res.status(400).json({ status: 'FAILED', message: 'Payment verification failed' });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
  