import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home as HomeIcon, Heart, Bell } from 'lucide-react';

export default function MyProfile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-[#FF5733] p-6 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-white rounded-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{currentUser?.displayName || 'User'}</h2>
            <p className="text-sm opacity-80">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6 space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Name</span>
              <span className="font-medium">{currentUser?.displayName || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{currentUser?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">+91 9876543210</span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Order #12345</p>
                <p className="text-sm text-gray-600">2 items • ₹999</p>
              </div>
              <span className="text-green-600">Delivered</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Order #12346</p>
                <p className="text-sm text-gray-600">1 item • ₹499</p>
              </div>
              <span className="text-yellow-600">Processing</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/my-orders')}
            className="mt-4 w-full py-2 text-[#FF5733] border border-[#FF5733] rounded-lg hover:bg-[#FF5733] hover:text-white transition-colors"
          >
            View All Orders
          </button>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <button className="w-full text-left py-2 text-gray-600 hover:text-[#FF5733]">
              Change Password
            </button>
            <button className="w-full text-left py-2 text-gray-600 hover:text-[#FF5733]">
              Update Profile Picture
            </button>
            <button className="w-full text-left py-2 text-gray-600 hover:text-[#FF5733]">
              Manage Notifications
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FF5733] border-t border-[#FFD66B] flex justify-around py-4">
        <button onClick={() => navigate('/home')} className="text-white">
          <HomeIcon className="w-6 h-6" />
        </button>
        <button onClick={() => navigate('/favorites')} className="text-white">
          <Heart className="w-6 h-6" />
        </button>
        <button onClick={() => navigate('/profile')} className="text-white">
          <Bell className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
} 