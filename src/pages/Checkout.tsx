// import { useState, useEffect } from 'react';
// import RazorpayPayment from '../components/RazorpayPayment';
// import { useCart } from '../contexts/CartContext';

// export default function Checkout() {
//   const [orderId, setOrderId] = useState<string>('');
//   const { total: totalAmount } = useCart();

//   useEffect(() => {
//     // Generate a unique order ID when component mounts
//     const newOrderId = `order_${Date.now()}_${Math.random().toString(36).slice(2)}`;
//     setOrderId(newOrderId);
//   }, []);

//   const handlePaymentSuccess = () => {
//     // Handle successful payment
//     // Additional logic like notifications, etc.
//   };

//   const handlePaymentFailure = () => {
//     // Handle payment failure
//     // Show error message, retry options, etc.
//   };

//   return (
//     <div className="min-h-screen pt-20 px-4">
//       {/* Order summary and other checkout details */}
      
//       <RazorpayPayment
//         orderId={orderId}
//         amount={totalAmount}
//         onSuccess={handlePaymentSuccess}
//         onFailure={handlePaymentFailure}
//       />
//     </div>
//   );
// } 
import { useState } from 'react';
import RazorpayPayment from '../components/RazorpayPayment';
import { useCart } from '../contexts/CartContext';

import { Spinner } from '../components/Spinner'; // Correct import path

export default function Checkout() {
  const { items: cartItems, total, loading, clearCart } = useCart();
  const [orderId] = useState(`order_${Math.random().toString(36).substr(2, 9)}`);
  const totalAmount = total; // Use the total from CartContext

  const handlePaymentSuccess = () => {
    console.log('Payment successful!');
    clearCart();
  };

  const handlePaymentFailure = () => {
    console.log('Payment failed!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Spinner /> {/* Show a loading spinner */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Add items to your cart to proceed to checkout.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg mr-4"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-semibold text-gray-900">₹{totalAmount}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Delivery Fee</p>
                  <p className="font-semibold text-gray-900">₹10</p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-lg font-bold text-gray-900">Total</p>
                  <p className="text-lg font-bold text-gray-900">₹{totalAmount + 10}</p>
                </div>
              </div>
            </div>

            {/* Razorpay Payment Component */}
            <RazorpayPayment
              orderId={orderId}
              amount={totalAmount}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
            />
          </>
        )}
      </div>
    </div>
  );
}