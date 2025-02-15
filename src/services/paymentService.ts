// import { db } from '../lib/firebase';
// import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

// interface PaymentDetails {
//   orderId: string;
//   amount: number;
//   currency?: string;
//   notes?: Record<string, string>;
// }

// export const paymentService = {
//   initializePayment: async ({ orderId, amount, notes = {} }: PaymentDetails) => {
//     const options = {
//       key: process.env.REACT_APP_RAZORPAY_KEY_ID!,
//       amount: amount * 100, // Razorpay expects amount in paise
//       currency: 'INR',
//       name: 'Campus Delivery',
//       description: `Order Payment #${orderId}`,
//       order_id: orderId,
//       notes: {
//         ...notes,
//         order_id: orderId
//       },
//       handler: async function (response: any) {
//         try {
//           // Save payment details to Firestore
//           await addDoc(collection(db, 'payments'), {
//             orderId,
//             paymentId: response.razorpay_payment_id,
//             signature: response.razorpay_signature,
//             amount,
//             status: 'success',
//             createdAt: new Date()
//           });

//           // Update order status
//           await updateDoc(doc(db, 'orders', orderId), {
//             paymentStatus: 'paid',
//             paymentId: response.razorpay_payment_id,
//             updatedAt: new Date()
//           });

//           return { success: true, data: response };
//         } catch (error) {
//           console.error('Payment verification error:', error);
//           throw error;
//         }
//       },
//       prefill: {
//         name: 'Student Name',
//         email: 'student@banasthali.in',
//         contact: '9999999999'
//       },
//       theme: {
//         color: '#FF5733'
//       }
//     };

//     return new Promise((resolve) => {
//       const rzp = new (window as any).Razorpay(options);
//       rzp.on('payment.failed', function (response: any) {
//         console.error('Payment failed:', response.error);
//       });
//       rzp.open();
//       resolve(rzp);
//     });
//   }
// }; 




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