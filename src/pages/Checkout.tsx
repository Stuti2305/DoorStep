import { useState, useEffect } from 'react';
import RazorpayPayment from '../components/RazorpayPayment';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { deliveryService } from '../services/deliveryService';

export default function Checkout() {
  const { items: cartItems, total, loading, clearCart } = useCart();
  const [deliveryTime] = useState(25); // Estimated delivery time in minutes
  const totalAmount = total;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);

  const handlePaymentSuccess = async () => {
    console.log('Payment successful!');
    if (!orderId) {
      console.error('No order ID found');
      return;
    }

    try {
      // Update order status to 'pending_delivery'
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'pending_delivery',
        statusHistory: [
          {
            status: 'pending_delivery',
            timestamp: new Date(),
            notes: 'Payment successful, waiting for delivery partner assignment'
          }
        ]
      });

      // Assign delivery man
      const deliveryMan = await deliveryService.assignDeliveryMan(orderId);
      if (deliveryMan) {
        console.log('Delivery man assigned:', deliveryMan);
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'assigned',
          statusHistory: [
            {
              status: 'assigned',
              timestamp: new Date(),
              notes: `Assigned to ${deliveryMan.name}`
            }
          ]
        });
      }

      navigate(`/tracking/${orderId}`);
      clearCart();
    } catch (error) {
      console.error('Error in post-payment processing:', error);
      // Still navigate to tracking page even if delivery man assignment fails
      navigate(`/tracking/${orderId}`);
      clearCart();
    }
  };

  const handlePaymentFailure = () => {
    console.log('Payment failed!');
  };

  const createOrder = async () => {
    if (!user) {
      console.error('No user found');
      return;
    }

    const newOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setOrderId(newOrderId);

    // Get shop information from the first cart item
    const firstItem = cartItems[0];
    if (!firstItem.shopId) {
      console.error('No shop ID found in cart items');
      return;
    }

    const orderData = {
      userId: user.uid,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        shopId: item.shopId
      })),
      total: totalAmount,
      status: 'pending',
      createdAt: new Date(),
      deliveryTime: deliveryTime,
      address: 'Hostel Aagar, Room 20', // This should be dynamic based on user's address
      shopId: firstItem.shopId,
      shopName: firstItem.shopName || '',
      shopAddress: firstItem.shopAddress || '',
      shopPhone: firstItem.shopPhone || '',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          notes: 'Order created, waiting for payment'
        }
      ]
    };

    try {
      await setDoc(doc(db, 'orders', newOrderId), orderData);
      console.log('Order created successfully:', newOrderId);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  useEffect(() => {
    createOrder();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-6">
        <h1 className="text-xl font-bold text-center text-gray-900 mb-6">CHECKOUT</h1>

        {/* Address Section */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Address</h3>
          <div className="bg-yellow-200 p-3 rounded-lg flex justify-between items-center">
            <p>Hostel Aagar, Room 20</p>
            <button className="text-orange-600">✎</button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex justify-between">
            Order Summary
          </h3>
          {cartItems.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Your cart is empty.</p>
              <Link
                to="/home"
                className="mt-2 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">29 Nov, 15:20 pm</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{item.price * item.quantity}</p>
                  <div className="flex items-center gap-2 text-orange-600">
                    <p className="text-xs">x{item.quantity}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Method */}
        <div className="mb-4 bg-yellow-200 p-3 rounded-lg">
          <h3 className="text-lg font-semibold flex justify-between">
            Payment Method
            <button className="text-orange-600">Edit</button>
          </h3>
          <p>Card/UPI/NetBanking</p>
        </div>

        {/* Delivery Time */}
        <div className="mb-4 bg-yellow-200 p-3 rounded-lg">
          <h3 className="text-lg font-semibold flex justify-between">
            Delivery Time
            <button className="text-orange-600">{deliveryTime} mins</button>
          </h3>
          <p>Estimated Delivery</p>
        </div>

        {/* Razorpay Payment Component */}
        {orderId && (
          <RazorpayPayment
            amount={totalAmount + 10} // Include delivery fee
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            orderId={orderId}
          />
        )}
      </div>
    </div>
  );
}