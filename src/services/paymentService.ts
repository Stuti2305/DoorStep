import { db } from '../lib/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

interface PaymentDetails {
  orderId: string;
  amount: number;
  currency?: string;
  notes?: Record<string, string>;
}

declare global {
  interface Window {
    Razorpay: any; // Define Razorpay as a global object
  }
}

export const paymentService = {
  initializePayment: async ({ orderId, amount }: PaymentDetails) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Campus Delivery',
      description: `Order Payment #${orderId}`,
      prefill: {
        name: 'Student Name',
        email: 'student@example.com',
        contact: '9999999999',
      },
      handler: function (response: any) {
        console.log('Payment successful:', response);

        // Save payment details to Firestore
        addDoc(collection(db, 'payments'), {
          orderId,
          paymentId: response.razorpay_payment_id,
          amount,
          status: 'success',
          createdAt: new Date(),
        });

        // Update order status in Firestore
        updateDoc(doc(db, 'orders', orderId), {
          paymentStatus: 'paid',
          paymentId: response.razorpay_payment_id,
          updatedAt: new Date(),
        });
      },
      modal: {
        ondismiss: function () {
          console.log('Checkout form closed');
        },
      },
    };

    return new Promise((resolve) => {
      const rzp = new window.Razorpay(options); // Use window.Razorpay
      rzp.open();
      resolve(rzp);
    });
  },
};