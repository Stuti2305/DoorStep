import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Edit2, X, Check } from 'lucide-react';

interface AdminData {
  name: string;
  email: string;
  admin_id: string;
  phone_number: string;
}

export default function AdminProfile() {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<AdminData>({
    name: '',
    email: '',
    admin_id: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'Admins', user.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            setAdminData({
              name: data.name || '',
              email: data.email || '',
              admin_id: data.admin_id || '',
              phone_number: data.phone_number || ''
            });
          }
        } catch (error) {
          console.error('Error fetching admin data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAdminData();
  }, [user]);

  const handleEdit = (field: string) => {
    setEditingField(field);
    setEditValue(adminData[field as keyof AdminData]);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = async (field: string) => {
    if (!user) return;
    
    try {
      const adminRef = doc(db, 'Admins', user.uid);
      await updateDoc(adminRef, {
        [field]: editValue
      });
      
      setAdminData(prev => ({
        ...prev,
        [field]: editValue
      }));
      setEditingField(null);
    } catch (error) {
      console.error('Error updating admin data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Admin Profile</h1>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            {/* Name Field */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                {editingField === 'name' ? (
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleSave('name')}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-gray-900">{adminData.name}</p>
                    <button
                      onClick={() => handleEdit('name')}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                {editingField === 'email' ? (
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="email"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleSave('email')}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-gray-900">{adminData.email}</p>
                    <button
                      onClick={() => handleEdit('email')}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Admin ID Field */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin ID</label>
                {editingField === 'admin_id' ? (
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleSave('admin_id')}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-gray-900">{adminData.admin_id}</p>
                    <button
                      onClick={() => handleEdit('admin_id')}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                {editingField === 'phone_number' ? (
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="tel"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleSave('phone_number')}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-gray-900">{adminData.phone_number}</p>
                    <button
                      onClick={() => handleEdit('phone_number')}
                      className="p-1 text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 