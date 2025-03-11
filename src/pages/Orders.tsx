import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Orders() {
  const location = useLocation();
  const isSuccess = location.state?.isSuccess || false; // Check if payment was successful
  const deliveryTime = 'Thu, 29th, 4:00 PM'; // Example delivery time

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-24 h-24 text-green-500" />
        </div>

        {/* Order Confirmed Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {isSuccess ? 'Order Confirmed' : 'Payment Failed'}
        </h1>
        <p className="text-gray-600 mb-6">
          {isSuccess
            ? 'Your order has been placed successfully.'
            : 'There was an issue processing your payment. Please try again.'}
        </p>

        {/* Delivery Time */}
        {isSuccess && (
          <p className="text-gray-600 mb-6">
            Delivery by <span className="font-semibold">{deliveryTime}</span>
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          {isSuccess && (
            <Link
              to="/tracking"
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Track My Order
            </Link>
          )}
          <Link
            to="/home"
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}