import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Home as HomeIcon, Heart, Bell } from 'lucide-react';

export default function MyProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studentData, setStudentData] = useState({
    stuname: '',
    stuemail: '',
    stuphno: ''
  });
  const [isEditing, setIsEditing] = useState({
    stuname: false,
    stuemail: false,
    stuphno: false
  });
  const [editValues, setEditValues] = useState({
    stuname: '',
    stuemail: '',
    stuphno: ''
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user) {
        const studentRef = doc(db, 'Students', user.uid);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          const data = studentSnap.data();
          setStudentData({
            stuname: data.stuname || '',
            stuemail: data.stuemail || '',
            stuphno: data.stuphno || ''
          });
        }
      }
    };
    fetchStudentData();
  }, [user]);

  const handleEdit = (field: string) => {
    setIsEditing(prev => ({ ...prev, [field]: true }));
    setEditValues(prev => ({ ...prev, [field]: studentData[field as keyof typeof studentData] }));
  };

  const handleSave = async (field: string) => {
    if (!user) return;
    
    try {
      const studentRef = doc(db, 'Students', user.uid);
      await updateDoc(studentRef, {
        [field]: editValues[field as keyof typeof editValues]
      });
      
      setStudentData(prev => ({
        ...prev,
        [field]: editValues[field as keyof typeof editValues]
      }));
      setIsEditing(prev => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error('Error updating student data:', error);
    }
  };

  const handleCancel = (field: string) => {
    setIsEditing(prev => ({ ...prev, [field]: false }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile Header */}
      {/* <div className="bg-[#FF5733] p-6 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-white rounded-full overflow-hidden">
            <img
              src={user?.photoURL || "https://images.unsplash.com/photo-1494790108377-be9c29b29330"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.displayName || 'Ginny Miller'}</h2>
            <p className="text-sm opacity-80">{user?.email || 'ginny234@gmail.com'}</p>
          </div>
        </div>
      </div> */}

      {/* Profile Details */}
      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-lg">Name</span>
              {isEditing.stuname ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editValues.stuname}
                    onChange={(e) => setEditValues(prev => ({ ...prev, stuname: e.target.value }))}
                    className="border rounded px-2 py-1"
                  />
                  <button
                    onClick={() => handleSave('stuname')}
                    className="text-green-600 hover:text-green-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleCancel('stuname')}
                    className="text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-lg">{studentData.stuname}</span>
                  <button
                    onClick={() => handleEdit('stuname')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-lg">Email</span>
              {isEditing.stuemail ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={editValues.stuemail}
                    onChange={(e) => setEditValues(prev => ({ ...prev, stuemail: e.target.value }))}
                    className="border rounded px-2 py-1"
                  />
                  <button
                    onClick={() => handleSave('stuemail')}
                    className="text-green-600 hover:text-green-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleCancel('stuemail')}
                    className="text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-lg">{studentData.stuemail}</span>
                  <button
                    onClick={() => handleEdit('stuemail')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-lg">Phone</span>
              {isEditing.stuphno ? (
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={editValues.stuphno}
                    onChange={(e) => setEditValues(prev => ({ ...prev, stuphno: e.target.value }))}
                    className="border rounded px-2 py-1"
                  />
                  <button
                    onClick={() => handleSave('stuphno')}
                    className="text-green-600 hover:text-green-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleCancel('stuphno')}
                    className="text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-lg">{studentData.stuphno}</span>
                  <button
                    onClick={() => handleEdit('stuphno')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              )}
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
        {/* <div className="bg-white rounded-xl shadow-md p-6">
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
        </div> */}
      </div>
    </div>
  );
}