import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Store, Plus, Trash2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Vendor {
  id: string;
  name: string;
  image: string;
  ownerId?: string;
  cuisine?: string;
  description?: string;
  address?: string;
  email?: string;
  deliveryTime?: string;
  phone?: string;
  priceForTwo?: number;
  rating?: number;
  promoted?: boolean;
  isactive?: boolean;
}

interface NewShop {
  name: string;
  cuisine: string;
  description: string;
  address: string;
  email: string;
  deliveryTime: string;
  image: string;
  phone: string;
  priceForTwo: number;
  rating: number;
  promoted: boolean;
  isactive: boolean;
}

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<Vendor>>({});
  const [showAddShop, setShowAddShop] = useState(false);
  const [newShop, setNewShop] = useState<NewShop>({
    name: '',
    cuisine: '',
    description: '',
    address: '',
    email: '',
    deliveryTime: '',
    image: '/images/shops/default.jpg',
    phone: '',
    priceForTwo: 0,
    rating: 0,
    promoted: false,
    isactive: true
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const shopsQuery = collection(db, 'shops');
        const shopsSnapshot = await getDocs(shopsQuery);
        const vendorsList = shopsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          image: doc.data().image || '/images/shops/default.jpg',
          ownerId: doc.data().ownerId,
          cuisine: doc.data().cuisine,
          description: doc.data().description,
          address: doc.data().address,
          email: doc.data().email,
          deliveryTime: doc.data().deliveryTime,
          phone: doc.data().phone,
          priceForTwo: doc.data().priceForTwo,
          rating: doc.data().rating,
          promoted: doc.data().promoted,
          isactive: doc.data().isactive
        }));
        setVendors(vendorsList);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleEdit = (vendorId: string) => {
    setEditingVendor(vendorId);
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setEditedValues(vendor);
    }
  };

  const handleSave = async (vendorId: string) => {
    try {
      const vendorRef = doc(db, 'shops', vendorId);
      await updateDoc(vendorRef, editedValues);
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, ...editedValues } : v
      ));
      setEditingVendor(null);
      setEditedValues({});
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  const handleAddShop = async () => {
    try {
      const docRef = await addDoc(collection(db, 'shops'), newShop);
      setVendors([...vendors, { id: docRef.id, ...newShop }]);
      setShowAddShop(false);
      setNewShop({
        name: '',
        cuisine: '',
        description: '',
        address: '',
        email: '',
        deliveryTime: '',
        image: '/images/shops/default.jpg',
        phone: '',
        priceForTwo: 0,
        rating: 0,
        promoted: false,
        isactive: true
      });
    } catch (error) {
      console.error('Error adding shop:', error);
    }
  };

  const handleDeleteShop = async (vendorId: string) => {
    try {
      await deleteDoc(doc(db, 'shops', vendorId));
      setVendors(vendors.filter(v => v.id !== vendorId));
    } catch (error) {
      console.error('Error deleting shop:', error);
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <button
            onClick={() => setShowAddShop(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Add Shop</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {vendors.map((vendor) => (
            <Link 
              key={vendor.id} 
              to={`/admin/vendor-products/${vendor.ownerId}`}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Shop Details Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shop Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price for Two</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingVendor === vendor.id ? (
                          <input
                            type="text"
                            value={editedValues.name || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, name: e.target.value })}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          vendor.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingVendor === vendor.id ? (
                          <input
                            type="text"
                            value={editedValues.cuisine || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, cuisine: e.target.value })}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          vendor.cuisine
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingVendor === vendor.id ? (
                          <textarea
                            value={editedValues.description || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, description: e.target.value })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          vendor.description
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingVendor === vendor.id ? (
                          <textarea
                            value={editedValues.address || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, address: e.target.value })}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          vendor.address
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingVendor === vendor.id ? (
                          <input
                            type="email"
                            value={editedValues.email || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, email: e.target.value })}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          vendor.email
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingVendor === vendor.id ? (
                          <input
                            type="text"
                            value={editedValues.deliveryTime || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, deliveryTime: e.target.value })}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          vendor.deliveryTime
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingVendor === vendor.id ? (
                          <input
                            type="tel"
                            value={editedValues.phone || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, phone: e.target.value })}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          vendor.phone
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingVendor === vendor.id ? (
                          <input
                            type="number"
                            value={editedValues.priceForTwo || 0}
                            onChange={(e) => setEditedValues({ ...editedValues, priceForTwo: Number(e.target.value) })}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          vendor.priceForTwo
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingVendor === vendor.id ? (
                          <input
                            type="number"
                            value={editedValues.rating || 0}
                            onChange={(e) => setEditedValues({ ...editedValues, rating: Number(e.target.value) })}
                            className="border rounded px-2 py-1"
                            min="0"
                            max="5"
                            step="0.1"
                          />
                        ) : (
                          vendor.rating
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingVendor === vendor.id ? (
                          <button
                            onClick={() => handleSave(vendor.id)}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            <Save size={20} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEdit(vendor.id)}
                            className="text-blue-600 hover:text-blue-900 mr-2"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteShop(vendor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Shop Modal */}
        {showAddShop && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Add New Shop</h2>
                <button
                  onClick={() => setShowAddShop(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newShop.name}
                    onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cuisine</label>
                  <input
                    type="text"
                    value={newShop.cuisine}
                    onChange={(e) => setNewShop({ ...newShop, cuisine: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newShop.description}
                    onChange={(e) => setNewShop({ ...newShop, description: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={newShop.address}
                    onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newShop.email}
                    onChange={(e) => setNewShop({ ...newShop, email: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={newShop.phone}
                    onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Time</label>
                  <input
                    type="text"
                    value={newShop.deliveryTime}
                    onChange={(e) => setNewShop({ ...newShop, deliveryTime: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price for Two</label>
                  <input
                    type="number"
                    value={newShop.priceForTwo}
                    onChange={(e) => setNewShop({ ...newShop, priceForTwo: Number(e.target.value) })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <input
                    type="number"
                    value={newShop.rating}
                    onChange={(e) => setNewShop({ ...newShop, rating: Number(e.target.value) })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="text"
                    value={newShop.image}
                    onChange={(e) => setNewShop({ ...newShop, image: e.target.value })}
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newShop.promoted}
                      onChange={(e) => setNewShop({ ...newShop, promoted: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Promoted</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newShop.isactive}
                      onChange={(e) => setNewShop({ ...newShop, isactive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleAddShop}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Shop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 