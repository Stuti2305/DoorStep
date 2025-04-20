import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function Tracking() {
  return (
    <div className="min-h-screen bg-yellow-100 py-12 px-6 sm:px-8 lg:px-12 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">TRACKING THE ORDER</h1>

        {/* Address Section */}
        <div className="mb-6 text-left">
          <h3 className="text-lg font-bold">Address</h3>
          <div className="bg-yellow-200 p-3 rounded-lg flex items-center gap-2">
            <MapPin className="text-orange-600" />
            <p>Hostel Aagar, Room 20</p>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mb-6 w-full h-48 bg-gray-300 rounded-lg flex items-center justify-center text-gray-700">
          <p>Map Component Placeholder</p>
        </div>

        {/* Delivery Time Section */}
        <div className="mb-6 text-left">
          <h3 className="text-lg font-bold">Delivery Time</h3>
          <p className="text-orange-600 font-bold text-xl">25 mins</p>
        </div>

        {/* Delivery Status */}
        <div className="text-left">
          <p className="mb-2 text-gray-700">Estimated Delivery</p>
          <ul className="text-gray-600 space-y-2">
            <li>✔ Your order has been accepted <span className="float-right">2 min</span></li>
            <li>✔ The restaurant is preparing your order <span className="float-right">5 min</span></li>
            <li>✔ The delivery is on his way <span className="float-right">10 min</span></li>
            <li>✔ Your order has been delivered <span className="float-right">8 min</span></li>
          </ul>
        </div>

        {/* Return Home Button */}
        <div className="mt-6">
          <Link
            to="/home"
            className="w-full py-3 bg-orange-500 text-white rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors block text-center"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
