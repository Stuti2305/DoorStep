import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Orders() {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const deliveryTime = 'Thu, 29th, 4:00 PM';

  return (
    <div className="min-h-screen bg-yellow-100 py-12 px-6 sm:px-8 lg:px-12 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
        <div className="flex justify-center mb-8">
          <CheckCircle className="w-24 h-24 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Confirmed</h1>
        <p className="text-gray-600 mb-8 text-lg">Your order has been placed successfully.</p>
        
        <div className="mb-6 bg-yellow-200 p-5 rounded-2xl text-lg">
          <h3 className="text-xl font-semibold">Delivery Time  (ESTIMATED)</h3>
          <p className="text-orange-600 font-bold text-xl">{deliveryTime}</p>
        </div>

        <div className="flex flex-col gap-6">
          <Link
            to={`/tracking/${orderId}`}
            className="w-full py-4 bg-orange-500 text-white rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Track My Order
          </Link>
          <Link
            to="/home"
            className="w-full py-4 bg-gray-900 text-white rounded-full text-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
