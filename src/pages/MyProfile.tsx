import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home as HomeIcon, Heart, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface StudentData {
  stuname: string;
}

export default function MyProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user) {
        try {
          const studentDoc = await getDoc(doc(db, 'Students', user.uid));
          if (studentDoc.exists()) {
            setStudentData(studentDoc.data() as StudentData);
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
        }
      }
    };

    fetchStudentData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile Header */}
      <div className="bg-[#FF5733] p-6 text-white">
        <div className="flex items-center gap-4 mb-6">
          {/* <div className="w-20 h-20 bg-white rounded-full overflow-hidden">
            <img
              src={currentUser?.photoURL || "https://images.unsplash.com/photo-1494790108377-be9c29b29330"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div> */}
          <div>
            <h2 className="text-2xl font-bold">{studentData?.stuname || user?.displayName || 'Student'}</h2>
            <p className="text-sm opacity-80">{user?.email || 'student@example.com'}</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-lg">Name</span>
              <span className="font-medium text-lg">{studentData?.stuname || user?.displayName || 'Student'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-lg">Email</span>
              <span className="font-medium text-lg">{user?.email || 'student@example.com'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-lg">Phone</span>
              <span className="font-medium text-lg">{user?.phoneNumber || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        {/* <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-lg">Order #12345</p>
                <p className="text-gray-600">2 items • ₹999</p>
              </div>
              <span className="text-green-600 font-medium">Delivered</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-lg">Order #12346</p>
                <p className="text-gray-600">1 item • ₹499</p>
              </div>
              <span className="text-yellow-600 font-medium">Processing</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/my-orders')}
            className="mt-6 w-full py-3 text-[#FF5733] border-2 border-[#FF5733] rounded-xl hover:bg-[#FF5733] hover:text-white transition-colors text-lg font-medium"
          >
            View All Orders
          </button>
        </div> */}

        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/change-password')}
              className="w-full text-left py-3 text-gray-600 hover:text-[#FF5733] text-lg"
            >
              Change Password
            </button>
            <button 
              onClick={() => navigate('/update-profile')}
              className="w-full text-left py-3 text-gray-600 hover:text-[#FF5733] text-lg"
            >
              Update Profile Picture
            </button>
            <button 
              onClick={() => navigate('/notifications')}
              className="w-full text-left py-3 text-gray-600 hover:text-[#FF5733] text-lg"
            >
              Manage Notifications
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
}