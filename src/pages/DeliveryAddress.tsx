import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Heart, Bell, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Address {
  id: string;
  hostel: string;
  room: string;
  phoneNumber: string;
  studentName: string;
  userId: string;
  isDefault: boolean;
  createdAt: Date;
}

export default function DeliveryAddress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    hostel: '',
    room: '',
    phoneNumber: '',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    try {
      const q = query(collection(db, 'Delivery_address'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const addressesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Address[];
      setAddresses(addressesData);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to fetch addresses');
    }
  };

  const handleAddAddress = async () => {
    if (!user) {
      toast.error('Please login to add address');
      return;
    }

    if (!newAddress.hostel || !newAddress.room || !newAddress.phoneNumber) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      // Get student data to get student name
      const studentDoc = await getDoc(doc(db, 'Students', user.uid));
      if (!studentDoc.exists()) {
        throw new Error('Student data not found');
      }
      const studentData = studentDoc.data();

      // If setting as default, update other addresses
      if (newAddress.isDefault) {
        const q = query(collection(db, 'Delivery_address'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.docs.forEach(async (doc) => {
          await updateDoc(doc.ref, { isDefault: false });
        });
      }

      // Add new address
      await addDoc(collection(db, 'Delivery_address'), {
        hostel: newAddress.hostel,
        room: newAddress.room,
        phoneNumber: newAddress.phoneNumber,
        studentName: studentData.stuname,
        userId: user.uid,
        isDefault: newAddress.isDefault,
        createdAt: new Date()
      });

      toast.success('Address added successfully');
      setShowAddForm(false);
      setNewAddress({
        hostel: '',
        room: '',
        phoneNumber: '',
        isDefault: false
      });
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  const handleRemoveAddress = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'Delivery_address', id));
      toast.success('Address removed successfully');
      fetchAddresses();
    } catch (error) {
      console.error('Error removing address:', error);
      toast.error('Failed to remove address');
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    
    try {
      // Update all addresses to non-default
      const q = query(collection(db, 'Delivery_address'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.docs.forEach(async (doc) => {
        await updateDoc(doc.ref, { isDefault: false });
      });

      // Set selected address as default
      await updateDoc(doc(db, 'Delivery_address', id), { isDefault: true });
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Delivery Addresses</h1>

        {/* Add New Address Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 mb-6 bg-[#FF5733] text-white rounded-lg hover:bg-[#FF5733]/90"
        >
          <Plus className="w-5 h-5" />
          Add New Address
        </button>

        {/* Add Address Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Address</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Hostel Name"
                className="w-full p-2 border rounded-lg"
                value={newAddress.hostel}
                onChange={(e) => setNewAddress({ ...newAddress, hostel: e.target.value })}
              />
              <input
                type="text"
                placeholder="Room Number"
                className="w-full p-2 border rounded-lg"
                value={newAddress.room}
                onChange={(e) => setNewAddress({ ...newAddress, room: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone Number"
                className="w-full p-2 border rounded-lg"
                value={newAddress.phoneNumber}
                onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="default"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                />
                <label htmlFor="default">Set as default address</label>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAddAddress}
                  className="flex-1 py-2 bg-[#FF5733] text-white rounded-lg"
                >
                  Save Address
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Address List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{address.hostel}</h3>
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">Room: {address.room}</p>
                  <p className="text-gray-600">Phone: {address.phoneNumber}</p>
                </div>
                <div className="flex gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-[#FF5733] hover:text-[#FF5733]/80"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveAddress(address.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 