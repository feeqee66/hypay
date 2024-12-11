// 'use client' directive to mark this as a Client Component
'use client';

import React, { useState } from 'react';
import PaymentButton from './PaymentButton';

const ParentComponent = () => {
  const [method, setMethod] = useState('Card');

  const handlePaymentClick = () => {
    console.log('Payment initiated with', method);
  };

  return (
    <div>
      <h1>Choose Payment Method</h1>
      <PaymentButton method={method} onClick={handlePaymentClick} />
    </div>
  );
};

export default ParentComponent;
