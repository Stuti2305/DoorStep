import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Phone,
  HelpCircle,
  Settings,
  LogOut,
  Home as HomeIcon,
  Heart,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    { icon: <ShoppingBag className="w-6 h-6" />, label: 'My Orders', path: '/my-orders' },
    { icon: <User className="w-6 h-6" />, label: 'My Profile', path: '/my-profile' },
    { icon: <MapPin className="w-6 h-6" />, label: 'Delivery Address', path: '/delivery-address' },
    { icon: <CreditCard className="w-6 h-6" />, label: 'Payment Methods', path: '/payment' },
    { icon: <Phone className="w-6 h-6" />, label: 'Contact Us', path: '/contact' },
    { icon: <HelpCircle className="w-6 h-6" />, label: 'Help & FAQs', path: '/help-faqs' },
    { icon: <Settings className="w-6 h-6" />, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FF5733]">
      {/* Profile Header */}
      <div className="p-6 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white rounded-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Manya</h2>
            <p className="text-sm opacity-80">manya@email.com</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-4 w-full text-white"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full text-white"
          >
            <LogOut className="w-6 h-6" />
            <span>Log Out</span>
          </button>
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