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
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Profile() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    const fetchStudentName = async () => {
      if (user) {
        try {
          const studentDoc = await getDoc(doc(db, 'Students', user.uid));
          if (studentDoc.exists()) {
            setStudentName(studentDoc.data().stuname || '');
          }
        } catch (error) {
          console.error('Error fetching student name:', error);
        }
      }
    };

    fetchStudentName();
  }, [user]);

  const menuItems = [
    { icon: <ShoppingBag className="w-6 h-6" />, label: 'My Orders', path: '/my-orders' },
    { icon: <User className="w-6 h-6" />, label: 'My Profile', path: '/my-profile' },
    { icon: <MapPin className="w-6 h-6" />, label: 'Delivery Address', path: '/delivery-address' },
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
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-orange-600 pb-28">
      {/* Container for centered content */}
      <div className="max-w-lg mx-auto px-6">
        {/* Profile Header */}
        <div className="pt-12 pb-8 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white">{studentName || 'Student'}</h2>
          <p className="text-base text-white/90">{user?.email || ''}</p>
        </div>

        {/* Menu Items Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10">
          <div className="divide-y divide-gray-100">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-5 w-full p-5 text-gray-700 hover:bg-orange-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                  {item.icon}
                </div>
                <span className="font-medium text-lg">{item.label}</span>
                <div className="ml-auto text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full bg-white p-5 rounded-2xl shadow-lg text-red-500 font-medium hover:bg-red-50 transition-colors text-lg"
        >
          <LogOut className="w-6 h-6" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}