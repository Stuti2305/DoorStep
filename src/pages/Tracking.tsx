import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, Clock, Circle } from 'lucide-react';

export default function Tracking() {
  const address = 'Hostel Aagar, Room 20';

  return (
    <div className="min-h-screen bg-yellow-50 py-12 px-4 sm:px-8 lg:px-12 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 sm:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
          Track Your Order
        </h1>

        {/* Address Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Delivery Address</h3>
          <div className="bg-yellow-200 p-4 rounded-xl flex items-center gap-3">
            <MapPin className="text-orange-600 w-5 h-5" />
            <span className="text-gray-800 font-medium">{address}</span>
          </div>
        </div>

        {/* Icon-Based Map Placeholder */}
        <div className="mb-8 w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-700 gap-2">
          <MapPin className="w-10 h-10 text-orange-500" />
          <p className="font-semibold text-gray-800">Tracking your delivery route...</p>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="animate-pulse">📍</span>
            <span>Hostel Aagar</span>
            <span className="mx-1">→</span>
            <span>Delivery Location</span>
            <span className="animate-bounce">🏁</span>
          </div>
        </div>

        {/* Delivery Time */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-1">Estimated Time of Arrival</h3>
          <div className="flex items-center gap-2 text-orange-600 text-2xl font-bold">
            <Clock className="w-6 h-6" />
            25 mins
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">Delivery Status</h3>
          <div className="space-y-5 border-l-4 border-orange-300 pl-6">
            <div className="relative">
              <CheckCircle className="absolute -left-7 top-1 text-green-600 w-5 h-5" />
              <p className="text-gray-800">
                Order Accepted <span className="text-sm text-gray-500 float-right">2 min</span>
              </p>
            </div>
            <div className="relative">
              <CheckCircle className="absolute -left-7 top-1 text-green-600 w-5 h-5" />
              <p className="text-gray-800">
                Preparing Order <span className="text-sm text-gray-500 float-right">5 min</span>
              </p>
            </div>
            <div className="relative">
              <Circle className="absolute -left-7 top-1 text-gray-400 w-5 h-5" />
              <p className="text-gray-800">
                On the Way <span className="text-sm text-gray-500 float-right">10 min</span>
              </p>
            </div>
            <div className="relative">
              <Circle className="absolute -left-7 top-1 text-gray-400 w-5 h-5" />
              <p className="text-gray-800">
                Delivered <span className="text-sm text-gray-500 float-right">8 min</span>
              </p>
            </div>
          </div>
        </div>

        {/* Return Home Button */}
        <div className="text-center">
          <Link
            to="/home"
            className="inline-block w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-300"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
