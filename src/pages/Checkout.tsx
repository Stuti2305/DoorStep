import { useState } from 'react';
import RazorpayPayment from '../components/RazorpayPayment';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../components/Spinner'; // Ensure this import is correct

export default function Checkout() {
  const { items: cartItems, total, loading, clearCart } = useCart();
  const [deliveryTime] = useState(25); // Estimated delivery time in minutes
  const totalAmount = total;
  const navigate = useNavigate();
  const [orderId] = useState(`order_${Math.random().toString(36).substr(2, 9)}`); // Generate a random order ID

  const handlePaymentSuccess = () => {
    console.log('Payment successful!');
    navigate('/tracking');
    clearCart();
  };

  const handlePaymentFailure = () => {
    console.log('Payment failed!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Spinner /> {/* Show a loading spinner */}
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
            
          </h3><button className="text-red-500 text-xs">Cancel Order</button>
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

        {/* Total Amount */}


        {/* Razorpay Payment Component */}
        <RazorpayPayment
          amount={totalAmount + 10} // Include delivery fee
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          orderId={orderId} // Pass the order ID
        />

        {/* Secured by Razorpay */}
        
      </div>
    </div>
  );
}