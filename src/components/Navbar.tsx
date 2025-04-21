import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isDeliveryPartner, setIsDeliveryPartner] = useState(false);

  useEffect(() => {
    const checkDeliveryPartner = async () => {
      if (user) {
        const deliveryPartnerRef = doc(db, 'delivery_man', user.uid);
        const deliveryPartnerSnap = await getDoc(deliveryPartnerRef);
        setIsDeliveryPartner(deliveryPartnerSnap.exists());
      }
    };

    checkDeliveryPartner();
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-navbar bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-white">
            Door step - Campus Delivery
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {isDeliveryPartner ? (
                  <Link
                    to="/delivery/settings"
                    className="p-2 hover:bg-blue-500 rounded-full transition-colors"
                  >
                    <User className="w-6 h-6 text-white" />
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    className="p-2 hover:bg-blue-500 rounded-full transition-colors"
                  >
                    <User className="w-6 h-6 text-white" />
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="p-2 hover:bg-blue-500 rounded-full transition-colors"
                >
                  <LogOut className="w-6 h-6 text-white" />
                </button>
              </>
            ) : (
              <Link
                to="/auth?mode=signin"
                className="px-4 py-2 bg-white text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}