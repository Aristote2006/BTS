const axios = require('axios');

class PaymentService {
  constructor() {
    this.baseURL = 'https://api.flutterwave.com/v3';
    this.secretKey = process.env.FLW_SECRET_KEY;
    this.publicKey = process.env.FLW_PUBLIC_KEY;
  }

  async initializePayment(data) {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments`,
        {
          tx_ref: data.reference,
          amount: data.amount,
          currency: 'RWF',
          redirect_url: `${process.env.CLIENT_URL}/payment/verify`,
          customer: {
            email: data.email
          },
          customizations: {
            title: 'Bus Ticket Payment',
            description: 'Payment for bus ticket',
            logo: 'https://your-logo-url.com/logo.png'
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Payment initialization failed');
    }
  }

  async verifyPayment(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Payment verification failed');
    }
  }

  async refundPayment(transactionId, amount) {
    try {
      const response = await axios.post(
        `${this.baseURL}/transactions/${transactionId}/refund`,
        {
          amount: amount
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Refund failed');
    }
  }

  async getTransactionHistory(params = {}) {
    try {
      const response = await axios.get(
        `${this.baseURL}/transactions`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`
          },
          params: params
        }
      );

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch transaction history');
    }
  }
}

module.exports = new PaymentService(); 