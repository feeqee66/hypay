let transactionData = null; // This will store the transaction data in-memory. You can store it in a database or session if needed.

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle the POST request for receiving the transaction data
    try {
      const data = req.body;

      // Save the transaction data. In a real-world scenario, you might store this in a database or session.
      transactionData = data;

      // Log the data for debugging
      console.log('Transaction Data Received:', data);

      res.status(200).json({ message: 'Transaction received successfully.' });
    } catch (err) {
      console.error('Error handling webhook:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    // Handle the GET request for retrieving the stored transaction data
    try {
      if (!transactionData) {
        return res.status(404).json({ message: 'Transaction data not found.' });
      }
      res.status(200).json(transactionData); // Return the stored data
    } catch (err) {
      console.error('Error fetching transaction data:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    // If the method is not POST or GET, return a Method Not Allowed error
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}

// Example function to fetch the stored transaction data (if needed elsewhere in the application)
export function getTransactionData() {
  return transactionData;
}
