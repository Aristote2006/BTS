import React from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Button } from '@mui/material';

const FlutterwavePayment = ({ booking, onSuccess }) => {
  const config = {
    public_key: process.env.REACT_APP_FLW_PUBLIC_KEY,
    tx_ref: Date.now(),
    amount: booking.totalAmount,
    currency: 'RWF',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: booking.user.email,
      phone_number: booking.user.phone,
      name: booking.user.name,
    },
    customizations: {
      title: 'Rwanda Bus Booking',
      description: `Payment for bus ticket from ${booking.route.from} to ${booking.route.to}`,
      logo: 'https://your-logo-url.com/logo.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  return (
    <Button
      variant="contained"
      color="primary"
      fullWidth
      onClick={() => {
        handleFlutterPayment({
          callback: (response) => {
            closePaymentModal();
            if (response.status === 'successful') {
              onSuccess(response);
            }
          },
          onClose: () => {},
        });
      }}
    >
      Pay with Flutterwave
    </Button>
  );
};

export default FlutterwavePayment; 