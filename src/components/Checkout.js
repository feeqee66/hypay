// /src/components/Checkout.js

import { useState, useEffect } from 'react';
import { load } from "@cashfreepayments/cashfree-js";

function Checkout() {
    const [cashfree, setCashfree] = useState(null);

    // Initialize Cashfree SDK
    useEffect(() => {
        const initializeSDK = async () => {
            try {
                const sdk = await load({
                    mode: "sandbox", // Change to 'production' for live transactions
                });
                setCashfree(sdk); // Set the cashfree instance
            } catch (error) {
                console.error('Error loading Cashfree SDK:', error);
            }
        };

        initializeSDK();
    }, []); // Empty dependency array ensures this runs once on component mount

    const doPayment = async () => {
        if (cashfree) {
            const checkoutOptions = {
                paymentSessionId: "your-payment-session-id", // Use the actual session ID here
                redirectTarget: "_self", // '_self' opens in the same tab, '_blank' opens in a new tab
            };
            cashfree.checkout(checkoutOptions); // Trigger checkout
        } else {
            console.error("Cashfree SDK not initialized");
        }
    };

    return (
        <div className="row">
            <p>Click below to open the checkout page in current tab</p>
            <button 
                type="button" 
                className="btn btn-primary" 
                id="renderBtn" 
                onClick={doPayment}>
                Pay Now
            </button>
        </div>
    );
}

export default Checkout;
