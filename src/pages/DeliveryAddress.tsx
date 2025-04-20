import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Heart, Bell, Plus, Trash2 } from 'lucide-react';

export default function DeliveryAddress() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Hostel 1',
      address: 'Room 123',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '300042',
      phone: '+91 9876543210',
      isDefault: true
    },
    {
      id: 2,
      name: 'Hostel 2',
      address: 'Room 420',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '300042',
      phone: '+91 9876543211',
      isDefault: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    isDefault: false
  });

  const handleAddAddress = () => {
    if (newAddress.isDefault) {
      setAddresses(addresses.map(addr => ({ ...addr, isDefault: false })));
    }
    setAddresses([...addresses, { ...newAddress, id: addresses.length + 1 }]);
    setShowAddForm(false);
    setNewAddress({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      isDefault: false
    });
  };

  const handleRemoveAddress = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
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
                placeholder="Address Name (e.g., Home, Office)"
                className="w-full p-2 border rounded-lg"
                value={newAddress.name}
                onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
              />
              <textarea
                placeholder="Full Address"
                className="w-full p-2 border rounded-lg"
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  className="w-full p-2 border rounded-lg"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="State"
                  className="w-full p-2 border rounded-lg"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Pincode"
                  className="w-full p-2 border rounded-lg"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full p-2 border rounded-lg"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                />
              </div>
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
                    <h3 className="font-semibold">{address.name}</h3>
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{address.address}</p>
                  <p className="text-gray-600">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-gray-600 mt-2">Phone: {address.phone}</p>
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