import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CreditCard } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { toast } from 'react-hot-toast';
import { addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { deliveryService } from '../services/deliveryService';

interface PaymentProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onFailure?: () => void;
}

export default function RazorpayPayment({
  orderId,
  amount,
  onSuccess,
  onFailure,
}: PaymentProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems } = useCart();

  const handlePayment = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Log to debug
      console.log('Starting payment with:', {
        orderId,
        amount,
        key: import.meta.env.VITE_RAZORPAY_KEY_ID
      });

      await paymentService.initializePayment({
        orderId,
        amount,
        notes: {
          type: 'campus_delivery'
        }
      });

      // Save order to Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        orderId: orderId,
        items: cartItems,
        status: 'pending',
        totalAmount: amount,
        createdAt: new Date(),
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(),
            notes: 'Order created'
          }
        ]
      });

      // Assign delivery partner
      try {
        const assignedDeliveryMan = await deliveryService.assignDeliveryMan(orderRef.id);
        if (!assignedDeliveryMan) {
          console.warn('No delivery partner available at the moment');
          // Update order status to indicate no delivery partner available
          await updateDoc(orderRef, {
            status: 'pending_delivery',
            statusHistory: [
              {
                status: 'pending_delivery',
                timestamp: new Date(),
                notes: 'Waiting for delivery partner'
              }
            ]
          });
        }
      } catch (deliveryError) {
        console.error('Error assigning delivery partner:', deliveryError);
        // Continue with order creation even if delivery assignment fails
      }

      // Success handling
      toast.success('Payment successful!');
      onSuccess?.();
      navigate('/orders', { state: { isSuccess: true, orderId: orderRef.id } });
    } catch (error: any) {
      console.error('Payment error details:', error);
      toast.error('Payment failed: ' + (error?.message || 'Please try again.'));
      onFailure?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Payment Details</h2>
        <Shield className="w-6 h-6 text-green-500" />
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Order Total</span>
          <span className="font-semibold">₹{amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-semibold">₹20</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between">
            <span className="font-semibold">Total Amount</span>
            <span className="font-semibold">₹{amount + 20}</span>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-3 bg-[#FF5733] text-white rounded-xl font-semibold
                   flex items-center justify-center gap-2 hover:opacity-90 
                   disabled:opacity-50"
      >
        <CreditCard className="w-5 h-5" />
        {loading ? 'Processing...' : 'Pay Now'}
      </motion.button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Secured by Razorpay
      </p>
    </div>
  );
}




